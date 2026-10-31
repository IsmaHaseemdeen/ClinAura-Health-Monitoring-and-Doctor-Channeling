using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SystemBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvancePaymentToAppointments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "AppointmentTime",
                table: "Appointments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<DateTime>(
                name: "AdvancePaidAt",
                table: "Appointments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "AdvancePaymentAmount",
                table: "Appointments",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "AdvancePaymentMethod",
                table: "Appointments",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AdvancePaymentReference",
                table: "Appointments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdvanceReceiptFileName",
                table: "Appointments",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdvanceReceiptPath",
                table: "Appointments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStage",
                table: "AppointmentPayments",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptFileName",
                table: "AppointmentPayments",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReceiptPath",
                table: "AppointmentPayments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReferenceNumber",
                table: "AppointmentPayments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdvancePaidAt",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AdvancePaymentAmount",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AdvancePaymentMethod",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AdvancePaymentReference",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AdvanceReceiptFileName",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AdvanceReceiptPath",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "PaymentStage",
                table: "AppointmentPayments");

            migrationBuilder.DropColumn(
                name: "ReceiptFileName",
                table: "AppointmentPayments");

            migrationBuilder.DropColumn(
                name: "ReceiptPath",
                table: "AppointmentPayments");

            migrationBuilder.DropColumn(
                name: "ReferenceNumber",
                table: "AppointmentPayments");

            migrationBuilder.AlterColumn<string>(
                name: "AppointmentTime",
                table: "Appointments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);
        }
    }
}
