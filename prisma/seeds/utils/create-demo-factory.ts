import { PrismaClient, Role } from "@prisma/client";
import { Profile } from "prisma/types";
import { GroupMock, OrganizationMock, UserMock } from "../types-mock";
import { addOrganizationsToGroup, addUsersToOrganization, assignCollaboratorsToDepartments, createDepartments, createGroup, createOrganizations, createUser } from "./methods";

export interface DemoConfig {
    group: GroupMock;
    organizations: OrganizationMock[];
    profiles: UserMock[];
    managerEmail: string;
}

export class CreateDemoFactory {
    constructor(private prisma: PrismaClient) { }

    async createDemo(configs: DemoConfig) {
        console.log('🚀 Iniciando criação do demo...');

        // Criar usuários
        const collaboratorsCreated: Profile[] = []
        for (const user of configs.profiles) {
            const createdUser = await createUser(user)
            if (user.role == Role.collaborator) {
                collaboratorsCreated.push(createdUser)
            }
        }
        console.log('✅ Usuários criados.');

        // Buscar gestor
        const manager = await this.prisma.profile.findFirst({
            where: {
                email: configs.managerEmail
            }
        })

        if (!manager) {
            throw new Error('Gestor não encontrado')
        }

        // Criar grupo
        const group = await createGroup(manager.id, configs.group)
        console.log('✅ Grupo criado.');

        // Criar organizações
        const organizations = await createOrganizations(manager.id, configs.organizations)
        console.log('✅ Organizações criadas.');

        // Adicionar organizações ao grupo
        await addOrganizationsToGroup(organizations, group.id)
        console.log('✅ Organizações adicionadas ao grupo.');

        // Criar departamentos
        const departments = await createDepartments(organizations[0].id, configs.organizations[0].departments || [])
        console.log('✅ Departamentos criados.');

        // Adicionar usuários à organização
        await addUsersToOrganization(organizations[0].id, collaboratorsCreated)
        console.log('✅ Colaboradores adicionados à organização.');

        // Distribuir colaboradores pelos departamentos
        await assignCollaboratorsToDepartments(organizations[0].id, departments)
        console.log('✅ Colaboradores distribuídos pelos departamentos.');

        console.log('🎉 Demo criado com sucesso!');

        return {
            group,
            organizations,
            departments,
            collaborators: collaboratorsCreated,
            manager
        };
    }
}