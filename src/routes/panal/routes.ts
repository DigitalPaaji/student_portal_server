import express from "express"
import { GetAllLeads, getLeadsStatusCounsta, getSingleLead } from "../../controller/panal/panalController";

const routes = express.Router();

routes.get("/leads/get",GetAllLeads)
routes.get("/leads/get/:id",getSingleLead)
routes.get("/lead/getleadstatus",getLeadsStatusCounsta)





export default routes

