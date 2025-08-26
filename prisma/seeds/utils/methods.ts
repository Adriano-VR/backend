import { Nr1Status, PrismaClient } from "@prisma/client";
import * as chalk from 'chalk';
import { Department, Organization, Profile } from "prisma/types";
import { SupabaseService } from "../../../src/supabase/supabase.service";
import { DepartmentMock, GroupMock, OrganizationMock } from "../types-mock";

const supabase = new SupabaseService().getClient();
const prisma = new PrismaClient();
export const createUser = async (user: any) => {
    try {


        const userToCreate = {
            ...user,
            cpf: Math.floor(10000000000 + Math.random() * 90000000000).toString()
        }

        // Verificar se o perfil já existe no banco
        const existingProfile = await prisma.profile.findFirst({
            where: {
                OR: [
                    { email: userToCreate.email },
                    { cpf: userToCreate.cpf }
                ]
            }
        });

        if (existingProfile) {
            console.log(chalk.yellow(`⚠️ Profile já existe no banco: ${existingProfile.name} (${existingProfile.email})`));
            return existingProfile;
        }

        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: userToCreate.email,
            password: userToCreate.password,
            email_confirm: true,
        });
        if (authError || !authUser.user) {
            throw new Error('Erro ao criar usuário user no Supabase: ' + (authError?.message || 'Desconhecido'));
        }
        console.log(chalk.green(`✅ Usuário user autenticado criado no Supabase: ${authUser.user.email}`));

        // 4.2 Criar profile no Prisma usando o mesmo ID do Supabase
        const profileDb = await prisma.profile.create({
            data: {
                id: authUser.user.id, // ID do usuário autenticado do Supabase
                name: userToCreate.name,
                displayName: userToCreate.name,
                email: userToCreate.email,

                cpf: userToCreate.cpf,
                whatsapp: userToCreate.whatsapp,
                role: userToCreate.role,
                emailConfirmed: true,
                jobTitle: userToCreate.jobTitle,

                slug: userToCreate.slug,
                completedOnboarding: userToCreate.completed_onboarding,
                ...(userToCreate.personalCorpEmail && { personalCorpEmail: userToCreate.personalCorpEmail }),
            },
        });

        console.log(chalk.green(`✅ Profile criado no banco: ${profileDb.name}`));

        return profileDb
    } catch (error) {
        throw error
    }







}


export const createOrganization = async (adminId: string, organization: OrganizationMock) => {
    try {
        const organizationCreated = await prisma.organization.create({
            data: {
                createdBy: {
                    connect: { id: adminId }
                },
                inviteCode: organization.inviteCode,
                name: organization.name,
                whatsapp: organization.whatsapp,
                type: organization.type,
                hasCompletedOnboarding: organization.hasCompletedOnboarding,
                headOfficeUuid: organization.headOfficeUuid,
                isActive: organization.isActive,
                nr1Status: organization.nr1Status as Nr1Status,
                registrationCode: organization.registrationCode,
                slug: organization.slug,
                cnpj: organization.cnpj,
                logo: organization.logo,
            },
        });



        return organizationCreated
    } catch (error) {
        throw error
    }
}

export const createOrganizations = async (adminId: string, organizationsMock: OrganizationMock[]) => {
    try {

        const organizations: Organization[] = []
        for (const organization of organizationsMock) {


            const organizationToCreate = {
                ...organization,
                cnpj: Math.floor(10000000000000 + Math.random() * 90000000000000).toString()
            }

            const organizationCreated = await createOrganization(adminId, organizationToCreate)
            organizations.push(organizationCreated)
        }
        return organizations
    } catch (error) {
        throw error
    }
}

export const addUsersToOrganization = async (organizationId: string, users: Profile[]) => {
    try {
        for (const user of users) {
            await addToOrganization(organizationId, user)
        }

    } catch (error) {
        throw error
    }
}

const addToOrganization = async (organizationId: string, user: any) => {
    try {

        await prisma.organizationMember.create({
            data: {
                profileId: user.id,
                organizationId: organizationId,
                role: user.role,
                status: 'active'
            }
        });
        console.log(`✅ ${user.name} adicionado como membro da organização`);

    } catch (error) {
        throw error
    }
}

export const createDepartments = async (organizationId: string, departments: DepartmentMock[]) => {
    try {
        const departmentsCreated: Department[] = []
        for (const department of departments) {
            const departmentCreated = await prisma.department.create({
                data: {
                    name: department.name,
                    slug: department.slug,
                    organizationId: organizationId,
                }
            })
            departmentsCreated.push(departmentCreated)
        }
        return departmentsCreated
    } catch (error) {
        throw error
    }
}

export const assignCollaboratorsToDepartments = async (organizationId: string, departments: Department[]) => {
    try {
        // Buscar todos os colaboradores da organização
        const collaborators = await prisma.profile.findMany({
            where: {
                role: 'collaborator',
                organizationMemberships: {
                    some: {
                        organizationId: organizationId,
                        status: 'active'
                    }
                }
            }
        });

        if (collaborators.length === 0) {
            console.log('Nenhum colaborador encontrado para distribuir');
            return;
        }

        // Distribuir colaboradores aleatoriamente pelos departamentos
        for (const collaborator of collaborators) {
            // Selecionar um departamento aleatório
            const randomDepartment = departments[Math.floor(Math.random() * departments.length)];

            // Atualizar o profile do colaborador com o departamento
            await prisma.profile.update({
                where: { id: collaborator.id },
                data: {
                    departmentId: randomDepartment.id
                }
            });

            console.log(`✅ ${collaborator.name} atribuído ao departamento: ${randomDepartment.name}`);
        }

        console.log(`✅ Distribuição aleatória concluída: ${collaborators.length} colaboradores distribuídos em ${departments.length} departamentos`);
    } catch (error) {
        throw error
    }
}

export const createGroup = async (adminId: string, groupMock: GroupMock) => {
    try {
        const group = await prisma.group.create({
            data: {
                name: groupMock.name,
                slug: groupMock.slug,

                createdBy: {
                    connect: { id: adminId }
                }
            }
        })
        return group
    } catch (error) {
        throw error
    }
}

export const addOrganizationsToGroup = async (organizations: Organization[], groupId: number) => {
    try {
        await prisma.group.update({
            where: { id: groupId },
            data: {
                organizations: {
                    connect: organizations.map((organization) => ({ id: organization.id }))
                }
            }
        })
    } catch (error) {
        throw error
    }
}