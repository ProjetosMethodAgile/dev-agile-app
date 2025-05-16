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
      // garanta que avgMin seja um number (ou string numérico)
      if (avgMin != null) {
        // primeiro parseFloat para garantir number, depois toFixed e novo parseFloat
        avgResolutionTime = parseFloat(parseFloat(avgMin).toFixed(2));
      } else {
        avgResolutionTime = 0;
      }
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
    // 1) filtrar setores permitidos para o atendente
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

    // 2) resolução média ao longo do tempo
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
                  ORDER BY h2."created_at" LIMIT 1
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

    // 3) volume por atendente (só count de status_change para 'Encerrado')
    // buscar dinamicamente o ID do status "Encerrado"
    const encerradoStatus = await devAgile.KanbanStatusCard.findOne({
      where: { nome: "Encerrado" },
      attributes: ["id"],
    });
    const encerradoStatusId = encerradoStatus?.id;

    const volume = await devAgile.KanbanStatusHistory.findAll({
      where: {
        empresa_id: companyId,
        status_card_id: encerradoStatusId, // só encerramentos
        action_type: "status_change", // só mudanças de status
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
        {
          model: devAgile.KanbanAtendenteHelpDesk,
          as: "atendente",
          attributes: [],
          include: [
            {
              model: devAgile.Usuario,
              as: "UsuarioAtendente",
              attributes: ["id", "nome"],
            },
          ],
        },
      ],
      attributes: [
        [col("atendente.UsuarioAtendente.nome"), "name"],
        [fn("COUNT", "*"), "value"],
      ],
      group: [
        "atendente->UsuarioAtendente.id",
        "atendente->UsuarioAtendente.nome",
      ],
      order: [["value", "DESC"]],
      raw: true,
    });

    // 4) distribuição de status
    const lastStatuses = await sequelizeDevAgileCli.query(
      `
    SELECT DISTINCT ON (h.card_id)
      h.card_id, h.status_card_id
    FROM kanban_status_histories h
    JOIN kanban_cards c ON c.id = h.card_id
    WHERE h.empresa_id = :companyId
      AND h.setor_id IN (:setorIds)
      AND (:dateFrom::timestamp IS NULL OR c."createdAt" >= :dateFrom::timestamp)
      AND (:dateTo  ::timestamp IS NULL OR c."createdAt" <= :dateTo::timestamp)
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

    // 5) heatmap
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

    // 6) retorno final
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
  // src/services/devagile_services/KanbanDashboard_Services.js

  /**
   * Retorna lista paginada de movimentações, com total e possibilidade de buscar por título.
   * @param {string} companyId
   * @param {string} userId
   * @param {string[]} overrideSetores
   * @param {string|null} dateFrom  // 'YYYY-MM-DD'
   * @param {string|null} dateTo    // 'YYYY-MM-DD'
   * @param {{ page: number, pageSize: number, search: string }} opts
   */
  async getMovements_Services(
    companyId,
    userId,
    overrideSetores = [],
    dateFrom = null,
    dateTo = null,
    { page = 1, pageSize = 5, search = "" } = {}
  ) {
    // 1) Descobrir quais setores o atendente pode ver
    const attendant = await devAgile.KanbanAtendenteHelpDesk.findOne({
      where: { usuario_id: userId, empresa_id: companyId },
      include: [
        { model: devAgile.KanbanSetores, as: "Setores", attributes: ["id"] },
      ],
    });
    const allowed = (attendant?.Setores || []).map((s) => s.id);
    const setorIds = overrideSetores.length
      ? overrideSetores.filter((id) => allowed.includes(id))
      : allowed;

    // 2) Construir filtro de data sobre history.created_at
    const historyWhere = { empresa_id: companyId };
    if (dateFrom) {
      historyWhere.created_at = {
        ...(historyWhere.created_at || {}),
        [Op.gte]: new Date(dateFrom),
      };
    }
    if (dateTo) {
      const dt = new Date(dateTo);
      dt.setHours(23, 59, 59, 999);
      historyWhere.created_at = {
        ...(historyWhere.created_at || {}),
        [Op.lte]: dt,
      };
    }

    // 3) Filtro de busca no título do card
    const titleWhere = search
      ? { titulo_chamado: { [Op.iLike]: `%${search}%` } }
      : {};

    // 4) Conta total de registros (para páginação)
    const total = await devAgile.KanbanStatusHistory.count({
      where: historyWhere,
      include: [
        {
          model: devAgile.KanbanCards,
          as: "card",
          where: titleWhere,
          include: [
            {
              model: devAgile.KanbanComlumns,
              as: "ColumnsCard",
              where: { setor_id: { [Op.in]: setorIds } },
            },
          ],
        },
      ],
    });

    // 5) Busca efetiva com offset/limit
    const recent = await devAgile.KanbanStatusHistory.findAll({
      where: historyWhere,
      include: [
        {
          model: devAgile.KanbanCards,
          as: "card",
          attributes: ["titulo_chamado"],
          where: titleWhere,
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
          include: [
            {
              model: devAgile.Usuario,
              as: "UsuarioAtendente",
              attributes: ["nome"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    // 6) Monta o objeto de resposta
    const movements = recent.map((r) => ({
      id: r.id,
      card_id: r.card_id,
      title: r.card?.titulo_chamado || null,
      action: r.action_type,
      previous_column: r.previousStatus?.nome || null,
      column_atual: r.status?.nome || null,
      who: r.atendente?.UsuarioAtendente?.nome || "Sistema",
      created_at: r.created_at,
    }));

    return { total, page, pageSize, movements };
  }

  /**
   * Retorna todos os cards criados (action_type = 'create_card') em uma data específica
   */
  // retorna chamados criados por data
  async getCreatedByDate_Services(
    companyId,
    userId,
    overrideSetores = [],
    dateFrom = null,
    dateTo = null
  ) {
    // setores permitidos
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

    // busca apenas action_type=create_card
    const records = await devAgile.KanbanStatusHistory.findAll({
      where: {
        empresa_id: companyId,
        action_type: "create_card",
        setor_id: { [Op.in]: setorIds },
        ...(dateFrom && { created_at: { [Op.gte]: dateFrom } }),
        ...(dateTo && { created_at: { [Op.lte]: dateTo } }),
      },
      include: [
        {
          model: devAgile.KanbanCards,
          as: "card",
          attributes: ["id", "titulo_chamado"],
          include: [
            {
              model: devAgile.KanbanComlumns,
              as: "ColumnsCard",
              attributes: ["nome"],
            },
            {
              model: devAgile.KanbanMotivos,
              as: "Motivo",
              attributes: ["nome"],
            },
          ],
        },
        {
          model: devAgile.Usuario,
          as: "usuario",
          attributes: ["nome"],
        },
        {
          model: devAgile.KanbanSetores,
          as: "setor",
          attributes: ["nome"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    // mapeia para CreatedCard[]
    return records.map((r) => ({
      id: r.id,
      cardId: r.card.id,
      title: r.card.titulo_chamado,
      createdAt: r.created_at,
      setor: r.setor?.nome || null,
      cliente: r.usuario?.nome || null,
      motivo: r.card.Motivo?.nome || null,
    }));
  }

  // src/services/devagile_services/KanbanDashboard_Services.js

  async getCalendar_Services(companyId, userId, monthFrom, monthTo) {
    // transforma “2025-05” em “2025-05-01”
    const fromDate = `${monthFrom}-01`;
    // e o toDate será o primeiro dia do mês seguinte
    const toDate = `${monthTo}-01`;

    const rows = await sequelizeDevAgileCli.query(
      `
    SELECT
      TO_CHAR(h.created_at, 'YYYY-MM-DD') AS date,
      COUNT(*) FILTER (WHERE h.action_type = 'create_card') AS count
    FROM kanban_status_histories h
    WHERE h.empresa_id = :companyId
      AND h.created_at >= :fromDate::date
      AND h.created_at <  (:toDate::date + INTERVAL '1 month')
    GROUP BY date
    ORDER BY date
  `,
      {
        replacements: { companyId, fromDate, toDate },
        type: QueryTypes.SELECT,
      }
    );

    return rows.map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));
  }
}

module.exports = KanbanDashboard_Services;
