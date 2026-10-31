using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SystemBackend.Data;
using SystemBackend.DTOs;
using SystemBackend.Models;

namespace SystemBackend.Controllers
{
    [ApiController]
    [Route("api/inquiries")]
    public class InquiryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InquiryController(ApplicationDbContext context)
        {
            _context = context;
        }

        /* =========================================================
           CREATE INQUIRY (PATIENT / DOCTOR)
        ========================================================= */
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateInquiry([FromBody] CreateInquiryDto request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var inquiry = new Inquiry
            {
                UserId = userId,
                Subject = request.Subject.Trim(),
                Message = request.Message.Trim(),
                Status = "Pending"
            };

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Inquiry submitted successfully." });
        }

        /* =========================================================
           GET MY INQUIRIES (PATIENT / DOCTOR)
        ========================================================= */
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyInquiries()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var inquiries = await _context.Inquiries
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(inquiries);
        }

        /* =========================================================
           ADMIN - GET ALL INQUIRIES
        ========================================================= */
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllInquiries()
        {
            var inquiries = await _context.Inquiries
                .Include(i => i.User)
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new
                {
                    i.Id,
                    UserName = i.User != null ? i.User.FullName : "",
                    i.Subject,
                    i.Message,
                    i.Reply,
                    i.Status,
                    i.CreatedAt,
                    i.RepliedAt
                })
                .ToListAsync();

            return Ok(inquiries);
        }

        /* =========================================================
           ADMIN - REPLY TO INQUIRY
        ========================================================= */
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/reply")]
        public async Task<IActionResult> ReplyInquiry(int id, [FromBody] ReplyInquiryDto request)
        {
            var inquiry = await _context.Inquiries.FindAsync(id);

            if (inquiry == null)
                return NotFound(new { message = "Inquiry not found." });

            inquiry.Reply = request.Reply.Trim();
            inquiry.Status = "Replied";
            inquiry.RepliedAt = DateTime.UtcNow;

            /* ===========================
               SEND NOTIFICATION
            =========================== */
            _context.Notifications.Add(new Notification
            {
                UserId = inquiry.UserId,
                Title = "Inquiry Reply",
                Message = "Admin has replied to your inquiry.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Reply sent successfully." });
        }
    }
}