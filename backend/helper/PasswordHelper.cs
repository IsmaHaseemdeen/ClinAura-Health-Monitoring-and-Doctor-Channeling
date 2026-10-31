using Microsoft.AspNetCore.Identity;
using SystemBackend.Models;

namespace SystemBackend.Helpers
{
    public static class PasswordHelper
    {
        public static string HashPassword(string password)
        {
            var hasher = new PasswordHasher<User>();
            return hasher.HashPassword(null!, password);
        }

        public static bool VerifyPassword(string hashedPassword, string enteredPassword)
        {
            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(null!, hashedPassword, enteredPassword);

            return result == PasswordVerificationResult.Success ||
                   result == PasswordVerificationResult.SuccessRehashNeeded;
        }
    }
}