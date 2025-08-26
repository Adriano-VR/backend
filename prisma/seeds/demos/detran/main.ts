import { PrismaClient } from "@prisma/client";
import { CreateDemoFactory } from "../../utils/create-demo-factory";
import organizationsFormsSeed from '../../utils/organizations-forms';
import submitedFormsSeed from "../../utils/submmited-forms-seed";
import { detranGroup, detranOrganizations, detranUsers } from "./data";

const prisma = new PrismaClient();

const mainDetranSeed = async () => {
    const configs = {
        group: detranGroup,
        organizations: detranOrganizations,
        profiles: detranUsers,
        adminEmail: 'gestor_detran@demo.com'
    }

    const factory = new CreateDemoFactory(prisma);
    await factory.createDemo(configs);
}

(async () => {
    await mainDetranSeed()
    await organizationsFormsSeed(["detran"])
    await submitedFormsSeed(["detran"])
})()
