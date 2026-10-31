using Microsoft.EntityFrameworkCore;
using SystemBackend.Models;

namespace SystemBackend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<PatientProfile> PatientProfiles { get; set; }
        public DbSet<DoctorProfile> DoctorProfiles { get; set; }
        public DbSet<HealthDocument> HealthDocuments { get; set; }
        public DbSet<SymptomSubmission> SymptomSubmissions { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<AppointmentPayment> AppointmentPayments { get; set; }
        public DbSet<ConsultationNote> ConsultationNotes { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Inquiry> Inquiries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasMaxLength(20);

            modelBuilder.Entity<User>()
                .HasOne(u => u.PatientProfile)
                .WithOne(p => p.User)
                .HasForeignKey<PatientProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasOne(u => u.DoctorProfile)
                .WithOne(d => d.User)
                .HasForeignKey<DoctorProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PatientProfile>()
                .HasMany(p => p.HealthDocuments)
                .WithOne(d => d.PatientProfile)
                .HasForeignKey(d => d.PatientProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SymptomSubmission>()
                .HasOne(s => s.PatientProfile)
                .WithMany()
                .HasForeignKey(s => s.PatientProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.PatientProfile)
                .WithMany()
                .HasForeignKey(a => a.PatientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.DoctorProfile)
                .WithMany()
                .HasForeignKey(a => a.DoctorProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.Status)
                .HasMaxLength(50);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.PaymentStatus)
                .HasMaxLength(30);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.PaymentAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Appointment>()
                .Property(a => a.AdvancePaymentAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Appointment>()
                .Property(a => a.AdvancePaymentMethod)
                .HasMaxLength(30);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.AdvancePaymentReference)
                .HasMaxLength(100);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.AdvanceReceiptFileName)
                .HasMaxLength(255);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.AdvanceReceiptPath)
                .HasMaxLength(500);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.Mode)
                .HasMaxLength(20);

            modelBuilder.Entity<Appointment>()
                .Property(a => a.AppointmentTime)
                .HasMaxLength(50);

            modelBuilder.Entity<Appointment>()
                .HasIndex(a => new
                {
                    a.DoctorProfileId,
                    a.AppointmentDate,
                    a.AppointmentTime,
                    a.Mode,
                    a.IsActive
                });

            modelBuilder.Entity<AppointmentPayment>()
                .HasOne(ap => ap.Appointment)
                .WithMany()
                .HasForeignKey(ap => ap.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AppointmentPayment>()
                .Property(ap => ap.Amount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<AppointmentPayment>()
                .Property(ap => ap.PaymentMethod)
                .HasMaxLength(30);

            modelBuilder.Entity<AppointmentPayment>()
                .Property(ap => ap.Status)
                .HasMaxLength(30);

            modelBuilder.Entity<AppointmentPayment>()
                .Property(ap => ap.PaymentStage)
                .HasMaxLength(30);

            modelBuilder.Entity<AppointmentPayment>()
                .Property(ap => ap.ReferenceNumber)
                .HasMaxLength(100);

            modelBuilder.Entity<AppointmentPayment>()
                .Property(ap => ap.ReceiptFileName)
                .HasMaxLength(255);

            modelBuilder.Entity<AppointmentPayment>()
                .Property(ap => ap.ReceiptPath)
                .HasMaxLength(500);

            modelBuilder.Entity<ConsultationNote>()
                .HasOne(c => c.Appointment)
                .WithMany()
                .HasForeignKey(c => c.AppointmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ConsultationNote>()
                .HasOne(c => c.DoctorProfile)
                .WithMany()
                .HasForeignKey(c => c.DoctorProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConsultationNote>()
                .HasOne(c => c.PatientProfile)
                .WithMany()
                .HasForeignKey(c => c.PatientProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AuditLog>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inquiry>()
                .HasOne(i => i.User)
                .WithMany()
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}