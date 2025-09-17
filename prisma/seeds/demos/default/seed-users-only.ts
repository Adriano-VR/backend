import { PrismaClient } from "@prisma/client";
import { createUser, createOrganizations, addUsersToOrganization, createDepartments, assignCollaboratorsToDepartments } from "../../utils/methods";
import { demoDefaultUsers, demoDefaultOrganizations } from "./data";

const prisma = new PrismaClient();

const seedUsersAndOrganization = async () => {
    console.log('🚀 Iniciando criação dos usuários e organização demo...');

    // Criar usuários
    const collaboratorsCreated: any[] = []
    let admin: any = null;
    
    for (const user of demoDefaultUsers) {
        try {
            const createdUser = await createUser(user);
            console.log(`✅ Usuário criado: ${createdUser.name} (${createdUser.email})`);
            
            // Separar colaboradores do gestor
            if (createdUser.role === 'collaborator') {
                collaboratorsCreated.push(createdUser);
            } else if (createdUser.role === 'admin') {
                admin = createdUser;
            }
        } catch (error) {
            console.error(`❌ Erro ao criar usuário ${user.name}:`, error);
        }
    }

    if (!admin) {
        throw new Error('Administrador não encontrado. Certifique-se de que existe um usuário com role "admin"');
    }

    // Criar organizações
    console.log('🏢 Criando organizações...');
    const organizations = await createOrganizations(admin.id, demoDefaultOrganizations);
    console.log('✅ Organizações criadas.');

    // Adicionar usuários à organização
    console.log('👥 Adicionando usuários à organização...');
    await addUsersToOrganization(organizations[0].id, collaboratorsCreated);
    console.log('✅ Usuários adicionados à organização.');

    // Adicionar admin como membro da organização
    console.log('👑 Adicionando admin como membro da organização...');
    await addUsersToOrganization(organizations[0].id, [admin]);
    console.log('✅ Admin adicionado como membro da organização.');

    // Criar departamentos
    console.log('🏢 Criando departamentos...');
    const departments = await createDepartments(organizations[0].id, demoDefaultOrganizations[0].departments || []);
    console.log('✅ Departamentos criados.');

    // Distribuir colaboradores pelos departamentos
    console.log('👥 Distribuindo colaboradores pelos departamentos...');
    await assignCollaboratorsToDepartments(organizations[0].id, departments);
    console.log('✅ Colaboradores distribuídos pelos departamentos.');

    console.log('🎉 Usuários e organização demo criados com sucesso!');
}

(async () => {
    try {
        await seedUsersAndOrganization();
    } catch (error) {
        console.error('❌ Erro durante o seed:', error);
    } finally {
        await prisma.$disconnect();
    }
})(); 