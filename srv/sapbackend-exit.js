const cds = require("@sap/cds");

module.exports = async (srv) => {
    const sapbackend = await cds.connect.to("sapbackend");
    const { Incidents } = srv.entities;

    srv.on("READ", Incidents, async (req) => {
        let IncidentsQuery = SELECT.from(req.query.SELECT.from).limit(
            req.query.SELECT.limit
        );

        if (req.query.SELECT.where) {
            IncidentsQuery.where(req.query.SELECT.where);
        }

        if (req.query.SELECT.orderBy) {
            IncidentsQuery.orderBy(req.query.SELECT.orderBy); // ← esto era 'where' por error
        }

        let incident = await sapbackend.tx(req).send({
            query: IncidentsQuery,
            headers: {
                Authorization: `${process.env.SAP_GATEWAY_AUTH}`
            },
        });

        let incidents = [];
        if (Array.isArray(incident)) {
            incidents = incident;
        } else {
            incidents[0] = incident;
        }
        return incidents;
    });
};
