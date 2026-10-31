using SystemBackend.Helpers;

namespace SystemBackend.Data
{
    public static class TestPasswordSeeder
    {
        public static void SeedKnownPasswords(ApplicationDbContext context)
        {
            var usersToSeed = new Dictionary<string, string>
            {
                { "admin101@clinaura.com", "Admin123!" },
                { "sarah.fernando@clinaura.com", "Doctor123!" },
                { "nimal.perera@clinaura.com", "Doctor123!" },
                { "ayesha.silva@clinaura.com", "Patient123!" },
                { "kamal.jayasuriya@clinaura.com", "Patient123!" },
                { "nethmi.wickramasinghe@clinaura.com", "Patient123!" }
            };

            var users = context.Users
                .Where(u => usersToSeed.Keys.Contains(u.Email))
                .ToList();

            foreach (var user in users)
            {
                user.PasswordHash = PasswordHelper.HashPassword(usersToSeed[user.Email]);
            }

            context.SaveChanges();
        }
    }
}