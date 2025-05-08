// services/devagile_services/KanbanDashboard_Services.js

"use strict";

const { Op, fn, col, literal, QueryTypes } = require("sequelize");
const { devAgile, sequelizeDevAgileCli } = require("../../models");

class KanbanDashboard_Services {
  // --------------------------------------------------
  // 1) Resumo numérico do dashboard
  // --------------------------------------------------
  async getSummary_Services(
    companyId,
    userId,
    overrideSetores = [],
    dateFrom = null,
    dateTo = null
  ) {
    // 1) quais setores o atendente pode ver
    const attendant = await devAgile.KanbanAtendenteHelpDesk.findOne({
      where: { usuario_id: userId, empresa_id: companyId },
      include: [
        { model: devAgile.KanbanSetores, as: "Setores", attributes: ["id"] },
      ],
    });
    const allowed = attendant?.Setores.map((s) => s.id) || [];
    const setorIds = overrideSetores.length
      ? overrideSetores.filter((id) => allowed.includes(id))
      : allowed;

    // 2) últimos status por card (filtrando por período de criação do card)
    const lastStatuses = await sequelizeDevAgileCli.query(
      `
      SELECT DISTINCT ON (h.card_id)
        h.card_id,
        h.status_card_id
      FROM kanban_status_histories h
      JOIN kanban_cards c ON c.id = h.card_id
      WHERE h.empresa_id = :companyId
        AND h.setor_id IN (:setorIds)
        AND (:dateFrom::timestamp IS NULL OR c."createdAt" >= :dateFrom::timestamp)
        AND (:dateTo  ::timestamp IS NULL OR c."createdAt" <= :dateTo  ::timestamp)
      ORDER BY h.card_id, h.created_at DESC
      `,
      {
        replacements: { companyId, setorIds, dateFrom, dateTo },
        type: QueryTypes.SELECT,
      }
    );

    // 3) totais por status
    const total = lastStatuses.length;
    const aberto = await devAgile.KanbanStatusCard.findOne({
      where: { nome: "Em Aberto" },
    });
    const andamento = await devAgile.KanbanStatusCard.findOne({
      where: { nome: "Em Andamento" },
    });
    const encerrado = await devAgile.KanbanStatusCard.findOne({
      where: { nome: "Encerrado" },
    });

    const open = lastStatuses.filter(
      (r) => r.status_card_id === aberto?.id
    ).length;
    const inProgress = lastStatuses.filter(
      (r) => r.status_card_id === andamento?.id
    ).length;
    const done = lastStatuses.filter(
      (r) => r.status_card_id === encerrado?.id
    ).length;

    // 4) SLA: dentro vs atrasados
    const slaStats = await sequelizeDevAgileCli.query(
      `
      SELECT
        COUNT(*) FILTER (
          WHERE (EXTRACT(
                   EPOCH FROM (close_time - create_time)
                 ) / 60) <= m.sla_minutes
        ) AS "withinSLA",
        COUNT(*) FILTER (
          WHERE (EXTRACT(
                   EPOCH FROM (close_time - create_time)
                 ) / 60)  > m.sla_minutes
        ) AS "lateCount"
      FROM (
        SELECT
          hs.card_id,
          MIN(hs.created_at) FILTER (WHERE hs.action_type = 'create_card') AS create_time,
          MAX(hs.created_at) FILTER (WHERE hs.status_card_id = :encerradoId) AS close_time
        FROM kanban_status_histories hs
        WHERE hs.empresa_id = :companyId
          AND hs.setor_id IN (:setorIds)
        GROUP BY hs.card_id
      ) timing
      JOIN kanban_cards c   ON c.id = timing.card_id
      JOIN kanban_motivos m ON m.id = c.motivo_id
      WHERE (:dateFrom::timestamp IS NULL OR c."createdAt" >= :dateFrom::timestamp)
        AND (:dateTo  ::timestamp IS NULL OR c."createdAt" <= :dateTo  ::timestamp)
      `,
      {
        replacements: {
          companyId,
          encerradoId: encerrado?.id,
          setorIds,
          dateFrom,
          dateTo,
        },
        type: QueryTypes.SELECT,
        plain: true,
      }
    );

    const withinSLA = parseInt(slaStats.withinSLA, 10) || 0;
    const lateCount = parseInt(slaStats.lateCount, 10) || 0;
    const slaRate = done
      ? parseFloat(((withinSLA / done) * 100).toFixed(2))
      : 0;

    // 5) tempo médio de resolução (minutos)
    let avgResolutionTime = 0;
    if (encerrado?.id) {
      const [{ avgMin } = {}] = await devAgile.KanbanStatusHistory.findAll({
        where: { empresa_id: companyId, status_card_id: encerrado.id },
        include: [
          {
            model: devAgile.KanbanCards,
            as: "card",
            attributes: [],
            where: {
              [Op.and]: [
                { createdAt: { [Op.gte]: dateFrom || new Date(0) } },
                { createdAt: { [Op.lte]: dateTo || new Date() } },
              ],
            },
            include: [
              {
                model: devAgile.KanbanComlumns,
                as: "ColumnsCard",
                attributes: [],
                where: { setor_id: { [Op.in]: setorIds } },
              },
            ],
          },
        ],
        attributes: [
          [
            fn(
              "AVG",
              literal(`
              EXTRACT(
                EPOCH FROM (
                  "created_at" - (
                    SELECT h2."created_at"
                      FROM kanban_status_histories h2
                     WHERE h2."card_id" = "KanbanStatusHistory"."card_id"
                       AND h2."action_type" = 'create_card'
                     ORDER BY h2."created_at"
                     LIMIT 1
                  )
                )
              ) / 60
            `)
            ),
            "avgMin",
          ],
        ],
        raw: true,
      });
      avgResolutionTime = avgMin ? parseFloat(avgMin.toFixed(2)) : 0;
    }

    // 6) média de interações por ticket
    const interactionsAgg = await devAgile.KanbanStatusHistory.findAll({
      where: {
        empresa_id: companyId,
        action_type: { [Op.in]: ["message_attendant", "message_client"] },
      },
      include: [
        {
          model: devAgile.KanbanCards,
          as: "card",
          attributes: [],
          where: {
            [Op.and]: [
              { createdAt: { [Op.gte]: dateFrom || new Date(0) } },
              { createdAt: { [Op.lte]: dateTo || new Date() } },
            ],
          },
          include: [
            {
              model: devAgile.KanbanComlumns,
              as: "ColumnsCard",
              attributes: [],
              where: { setor_id: { [Op.in]: setorIds } },
            },
          ],
        },
      ],
      attributes: ["card_id", [fn("COUNT", "*"), "cnt"]],
      group: ["card_id"],
      raw: true,
    });
    const avgInteractions = interactionsAgg.length
      ? parseFloat(
          (
            interactionsAgg.reduce((sum, r) => sum + parseInt(r.cnt, 10), 0) /
            interactionsAgg.length
          ).toFixed(2)
        )
      : 0;

    return {
      total,
      open,
      inProgress,
      done,
      late: lateCount,
      avgResolutionTime,
      slaRate,
      avgInteractions,
    };
  }

  // --------------------------------------------------
  // 2) Dados para os gráficos
  // --------------------------------------------------
  async getCharts_Services(
    companyId,
    userId,
    overrideSetores = [],
    dateFrom = null,
    dateTo = null
  ) {
    // filtro de setores
    const attendant = await devAgile.KanbanAtendenteHelpDesk.findOne({
      where: { usuario_id: userId, empresa_id: companyId },
      include: [
        { model: devAgile.KanbanSetores, as: "Setores", attributes: ["id"] },
      ],
    });
    const allowed = attendant?.Setores.map((s) => s.id) || [];
    const setorIds = overrideSetores.length
      ? overrideSetores.filter((id) => allowed.includes(id))
      : allowed;

    // a) resolução ao longo do tempo
    const resolution = await devAgile.KanbanStatusHistory.findAll({
      where: { empresa_id: companyId },
      include: [
        {
          model: devAgile.KanbanCards,
          as: "card",
          attributes: [],
          where: {
            [Op.and]: [
              { createdAt: { [Op.gte]: dateFrom || new Date(0) } },
              { createdAt: { [Op.lte]: dateTo || new Date() } },
            ],
          },
          include: [
            {
              model: devAgile.KanbanComlumns,
              as: "ColumnsCard",
              attributes: [],
              where: { setor_id: { [Op.in]: setorIds } },
            },
          ],
        },
      ],
      attributes: [
        [fn("TO_CHAR", col("created_at"), "YYYY-MM-DD"), "name"],
        [
          fn(
            "AVG",
            literal(`
            EXTRACT(
              EPOCH FROM (
                "created_at" - (
                  SELECT h2."created_at"
                    FROM kanban_status_histories h2
                   WHERE h2."card_id" = "KanbanStatusHistory"."card_id"
                     AND h2."action_type" = 'create_card'
                   ORDER BY h2."created_at"
                   LIMIT 1
                )
              )
            ) / 60
          `)
          ),
          "value",
        ],
      ],
      group: ["name"],
      order: [[literal("name"), "ASC"]],
      raw: true,
    });

    // b) volume por atendente
    const volume = await devAgile.KanbanStatusHistory.findAll({
      where: { empresa_id: companyId },
      include: [
        {
          model: devAgile.KanbanCards,
          as: "card",
          attributes: [],
          where: {
            [Op.and]: [
              { createdAt: { [Op.gte]: dateFrom || new Date(0) } },
              { createdAt: { [Op.lte]: dateTo || new Date() } },
            ],
          },
          include: [
            {
              model: devAgile.KanbanComlumns,
              as: "ColumnsCard",
              attributes: [],
              where: { setor_id: { [Op.in]: setorIds } },
            },
          ],
        },
      ],
      attributes: [
        [col("changed_by"), "name"],
        [fn("COUNT", "*"), "value"],
      ],
      group: ["name"],
      raw: true,
    });

    // c) distribuição de status (último por card)
    const lastStatuses = await sequelizeDevAgileCli.query(
      `
      SELECT DISTINCT ON (h.card_id)
        h.card_id,
        h.status_card_id
      FROM kanban_status_histories h
      JOIN kanban_cards c ON c.id = h.card_id
      WHERE h.empresa_id = :companyId
        AND h.setor_id IN (:setorIds)
        AND (:dateFrom::timestamp IS NULL OR c."createdAt" >= :dateFrom::timestamp)
        AND (:dateTo  ::timestamp IS NULL OR c."createdAt" <= :dateTo  ::timestamp)
      ORDER BY h.card_id, h.created_at DESC
      `,
      {
        replacements: { companyId, setorIds, dateFrom, dateTo },
        type: QueryTypes.SELECT,
      }
    );
    const counts = lastStatuses.reduce((acc, { status_card_id }) => {
      acc[status_card_id] = (acc[status_card_id] || 0) + 1;
      return acc;
    }, {});
    const cards = await devAgile.KanbanStatusCard.findAll({
      where: { id: { [Op.in]: Object.keys(counts) } },
    });
    const statusDistribution = cards.map((s) => ({
      name: s.nome,
      value: counts[s.id] || 0,
    }));

    // d) heatmap
    const calendar = await devAgile.KanbanStatusHistory.findAll({
      where: { empresa_id: companyId },
      include: [
        {
          model: devAgile.KanbanCards,
          as: "card",
          attributes: [],
          where: {
            [Op.and]: [
              { createdAt: { [Op.gte]: dateFrom || new Date(0) } },
              { createdAt: { [Op.lte]: dateTo || new Date() } },
            ],
          },
          include: [
            {
              model: devAgile.KanbanComlumns,
              as: "ColumnsCard",
              attributes: [],
              where: { setor_id: { [Op.in]: setorIds } },
            },
          ],
        },
      ],
      attributes: [
        [fn("TO_CHAR", col("created_at"), "YYYY-MM-DD"), "date"],
        [fn("COUNT", "*"), "count"],
      ],
      group: ["date"],
      order: [[literal("date"), "ASC"]],
      raw: true,
    });

    return {
      resolutionOverTime: resolution.map((r) => ({
        name: r.name,
        value: parseFloat(r.value),
      })),
      volumeByAttendant: volume.map((r) => ({
        name: r.name || "Sistema",
        value: parseInt(r.value, 10),
      })),
      statusDistribution,
      calendarHeatmap: calendar.map((r) => ({
        date: r.date,
        count: parseInt(r.count, 10),
      })),
    };
  }

  // --------------------------------------------------
  // 3) Últimas 5 movimentações
  // --------------------------------------------------
  async getMovements_Services(
    companyId,
    userId,
    overrideSetores = [],
    dateFrom = null,
    dateTo = null
  ) {
    const attendant = await devAgile.KanbanAtendenteHelpDesk.findOne({
      where: { usuario_id: userId, empresa_id: companyId },
      include: [
        { model: devAgile.KanbanSetores, as: "Setores", attributes: ["id"] },
      ],
    });
    const allowed = attendant?.Setores.map((s) => s.id) || [];
    const setorIds = overrideSetores.length
      ? overrideSetores.filter((id) => allowed.includes(id))
      : allowed;

    const recent = await devAgile.KanbanStatusHistory.findAll({
      where: { empresa_id: companyId },
      include: [
        {
          model: devAgile.KanbanCards,
          as: "card",
          attributes: ["titulo_chamado"],
          where: {
            [Op.and]: [
              { createdAt: { [Op.gte]: dateFrom || new Date(0) } },
              { createdAt: { [Op.lte]: dateTo || new Date() } },
            ],
          },
          include: [
            {
              model: devAgile.KanbanComlumns,
              as: "ColumnsCard",
              attributes: [],
              where: { setor_id: { [Op.in]: setorIds } },
            },
          ],
        },
        {
          model: devAgile.KanbanStatusCard,
          as: "status",
          attributes: ["nome"],
        },
        {
          model: devAgile.KanbanStatusCard,
          as: "previousStatus",
          attributes: ["nome"],
        },
        {
          model: devAgile.KanbanAtendenteHelpDesk,
          as: "atendente",
          attributes: ["id"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 5,
    });

    return recent.map((r) => ({
      id: r.id,
      card_id: r.card_id,
      action: r.action_type,
      from: r.previous_column,
      to: r.column_atual,
      who: r.atendente?.UsuarioAtendente?.nome || "Sistema",
      created_at: r.created_at,
    }));
  }
}

module.exports = KanbanDashboard_Services;
