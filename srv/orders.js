const cds = require("@sap/cds");
const { message } = require("@sap/cds/lib/log/cds-error");
const { Orders } = cds.entities("ManageOrders");

module.exports = (srv) => {
    srv.before("*", async (req) => {
        console.log(`Method: ${req.method}`);
        console.log(`Target: ${req.target}`);
    });

    //**********READ */
    srv.on("READ", "Orders", async (req) => {

        if (req.data.ClientEmail !== undefined) {
            return await SELECT.from`com.training.Orders`.where`ClientEmail = ${req.data.ClientEmail}`;
        }

        return await SELECT.from(Orders);
    });

    srv.after("READ", "Orders", (data) => {
        data.map((order) => (order.Reviewed = true))
    });


    //**********CREATE */

    srv.on("CREATE", "Orders", async (req) => {
        let returnData = await cds.transaction(req).run(
            INSERT.into(Orders).entries({
                ClientEmail: req.data.ClientEmail,
                FirstName: req.data.FirstName,
                LastName: req.data.LastName,
                CreatedOn: req.data.CreatedOn,
                Reviewed: req.data.Reviewed,
                Approved: req.data.Approved
            })
        )
            .then((resolve, reject) => {
                console.log("Resolve", resolve);
                console.log("Reject", reject);

                if (typeof resolve !== "undefined") {
                    return req.data;
                } else {
                    req.error(409, "Record not finded");

                }
            })
            .catch((err) => {
                console.log(err);
                req.error(err.code, err.message);
            });

        return returnData;
    });

    srv.before("CREATE", "Orders", (req) => {
        req.data.CreatedOn = new Date().toISOString().slice(0, 10);
        return req;
    });

    //* UPDATE *****//

    srv.on("UPDATE", "Orders", async (req) => {
        let returnData = await cds.transaction(req).run([
            UPDATE(Orders, req.data.ClientEmail).set({
                FirstName: req.data.FirstName,
                LastName: req.data.LastName
            })
        ]).then((resolve, reject) => {
            console.log("Resolve: ", resolve);
            console.log("Reject: ", reject);

            if (resolve[0] == 0) {
                req.error(409, "Record Not Found");
            }

        }).catch((err) => {
            console.log(err);
            req.error(err.code, err.message)
        });
        console.log("Before End", returnData);
        return returnData;
    });


    // DELETE Order //

    srv.on("DELETE", "Orders", async (req) => {
        let returnData = await cds.transaction(req).run(
            DELETE.from(Orders).where({
                ClientEmail: req.data.ClientEmail
            })
        ).then((resolve, reject) => {
            console.log("Resolve", resolve);
            console.log("reject", reject);

            if (resolve !== 1) {
                req.error(409, "Record Not Found")
            }
        })
            .catch((err) => {
                console.log(err);
                req.error(err.code, err.message);
            });
        console.log("Before End", returnData);
        return await returnData;
    });


    // FUNCTION //

    srv.on("getClientTaxRate", async (req) => {
        //NO server side-effect
        const { clientEmail } = req.data;
        const db = srv.transaction(req);

        const results = await db.read(Orders, ["Country_code"]).where({ ClientEmail: clientEmail });

        console.log(results[0]);

        switch (results[0].Country_code) {
            case 'ES':
                return 21.5;
            case 'UK':
                return 24.6;

            default:
                break;
        }
    });

    //* ACTION *****//

    srv.on("cancelOrder", async (req) => {
        const { clientEmail } = req.data;
        const db = srv.transaction(req);

        const resultsRead = await db.read(Orders, ["FirstName", "LastName", "Approved"])
            .where({ ClientEmail: clientEmail });

        let returnOrder = {
            status: "",
            message: "",
        };

        console.log(clientEmail);
        console.log(resultsRead);

        if (resultsRead[0].Approved == false) {
            const resultsUpdate = await db
                .update(Orders).set({ Status: 'C' }).where({ ClientEmail: clientEmail });
            returnOrder.status = "Succeeded";
            returnOrder.message = `The Order placed by ${resultsRead[0].FirstName} ${resultsRead[0].LastName} was canceled`;
        } else {
            returnOrder.status = "Failed";
            returnOrder.message = `The Order placed by ${resultsRead[0].FirstName} ${resultsRead[0].LastName} was NOT canceled`;
        }

        console.log("Action cancelOrder executed ");
        return returnOrder;

    });

};