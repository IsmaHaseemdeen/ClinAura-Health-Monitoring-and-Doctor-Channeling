using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SystemBackend.Data;
using SystemBackend.DTOs;
using SystemBackend.Helpers;
using SystemBackend.Models;
using SystemBackend.Services;

namespace SystemBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(ApplicationDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        /* =========================================================
           LOGIN
           Validates the user's email and password, then returns
           a JWT token with the user's role and account details.
        ========================================================= */
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
        {
            if (model == null ||
                string.IsNullOrWhiteSpace(model.Email) ||
                string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            var normalizedEmail = model.Email.Trim().ToLower();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "This account is inactive." });
            }

            var isPasswordValid = PasswordHelper.VerifyPassword(user.PasswordHash, model.Password);

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var token = _tokenService.CreateToken(user);

            return Ok(new
            {
                token,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            });
        }

        /* =========================================================
           PATIENT REGISTRATION
           This route is used only for public website registration.
           It creates:
           1. a User account with Patient role
           2. a linked PatientProfile
        ========================================================= */
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto model)
        {
            if (model == null ||
                string.IsNullOrWhiteSpace(model.FullName) ||
                string.IsNullOrWhiteSpace(model.Email) ||
                string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { message = "Full name, email, and password are required." });
            }

            var normalizedEmail = model.Email.Trim().ToLower();

            var existingUser = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == normalizedEmail);

            if (existingUser)
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            var user = new User
            {
                FullName = model.FullName.Trim(),
                Email = normalizedEmail,
                Role = "Patient",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                PasswordHash = PasswordHelper.HashPassword(model.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var patientProfile = new PatientProfile
            {
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                ConsentAccepted = false
            };

            _context.PatientProfiles.Add(patientProfile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful." });
        }
    }
}