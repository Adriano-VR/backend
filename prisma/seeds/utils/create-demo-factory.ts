import { PrismaClient, Role } from "@prisma/client";
import { Profile } from "prisma/types";
import { GroupMock, OrganizationMock, UserMock } from "../types-mock";
import { addOrganizationsToGroup, addUsersToOrganization, assignCollaboratorsToDepartments, createDepartments, createGroup, createOrganizations, createUser } from "./methods";

export interface DemoConfig {
    group: GroupMock;
    organizations: OrganizationMock[];
    profiles: UserMock[];
    adminEmail: string;
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

        // Buscar administrador
        const admin = await this.prisma.profile.findFirst({
            where: {
                email: configs.adminEmail
            }
        })

        if (!admin) {
            throw new Error('Administrador não encontrado')
        }

        // Criar grupo
        const group = await createGroup(admin.id, configs.group)
        console.log('✅ Grupo criado.');

        // Criar organizações
        const organizations = await createOrganizations(admin.id, configs.organizations)
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

        // Adicionar admin como membro da organização
        await addUsersToOrganization(organizations[0].id, [admin])
        console.log('✅ Admin adicionado como membro da organização.');

        // Distribuir colaboradores pelos departamentos
        await assignCollaboratorsToDepartments(organizations[0].id, departments)
        console.log('✅ Colaboradores distribuídos pelos departamentos.');

        console.log('🎉 Demo criado com sucesso!');

        return {
            group,
            organizations,
            departments,
            collaborators: collaboratorsCreated,
            admin
        };
    }
}