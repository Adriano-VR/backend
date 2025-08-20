import { SupabaseService } from "../../../src/supabase/supabase.service";
import { demoDefaultUsers } from "../demos/default/data";
import { detranUsers } from "../demos/detran/data";


const supabase = new SupabaseService().getClient();

async function main() {

    const demoEmails = demoDefaultUsers.map(user => user.email);
    const detranEmailsCollaborators = detranUsers.map(user => user.email);
    const detranEmailsManagers = detranUsers.map(user => user.collaborators?.map(collaborator => collaborator.email)).flat();
    const emails = [...demoEmails, ...detranEmailsCollaborators, ...detranEmailsManagers];

    try {
        for (const email of emails) {
            const { data: users, error: listUsersError } = await supabase.auth.admin.listUsers();
            if (listUsersError) {
                console.error(listUsersError, 'Erro ao listar usuários do Supabase')
            }

            const user = users.users.find((user: any) => user.email === email);
            if (user) {
                const { data: deletedUser, error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
                if (deleteUserError) {
                    console.error(deleteUserError, 'Erro ao deletar usuário de teste do Supabase')
                }

                console.log(`Usuário ${email} deletado com sucesso`)
            }
        }

        console.log('Usuários de teste deletados com sucesso')
    } catch (error) {

        console.error(error, 'Erro ao deletar usuários de teste do Supabase')
        throw error
    }

}
// Executa apenas se o arquivo foi chamado diretamente
if (require.main === module) {
    main()
        .catch((e) => {
            console.error('❌ Erro ao deletar usuários de teste do Supabase:', e);
            process.exit(1);
        })

}