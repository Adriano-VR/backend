import { PrismaClient } from "@prisma/client";
import { CreateDemoFactory } from "../../utils/create-demo-factory";
import organizationsFormsSeed from '../../utils/organizations-forms';
import submitedFormsSeed from "../../utils/submmited-forms-seed";
import { demoDefaultGroup, demoDefaultOrganizations, demoDefaultUsers } from "./data";

const prisma = new PrismaClient();

const mainDefaultSeed = async () => {
    const configs = {
        group: demoDefaultGroup,
        organizations: demoDefaultOrganizations,
        profiles: demoDefaultUsers,
        managerEmail: 'gestor@demo.com'
    }

    const factory = new CreateDemoFactory(prisma);
    await factory.createDemo(configs);
}

(async () => {
    await mainDefaultSeed()
    await organizationsFormsSeed(["organizacao-exemplo"])
    await submitedFormsSeed(["organizacao-exemplo"])
})()
