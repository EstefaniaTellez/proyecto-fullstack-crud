using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using ProjectManagement.API.Models;

namespace ProjectManagement.API.Data;

public partial class ProjectManagementContext : DbContext
{

    public ProjectManagementContext(DbContextOptions<ProjectManagementContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Assignment> Assignments { get; set; }
    public virtual DbSet<Developer> Developers { get; set; }
    public virtual DbSet<Project> Projects { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => new { e.ProjectId, e.DeveloperId }).HasName("PK_assignments");

            entity.HasOne(d => d.Developer).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.DeveloperId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_assignment_developer");

            entity.HasOne(d => d.Project).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_assignment_project");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasIndex(e => e.Name, "UQ_projects_name").IsUnique();
        });

        modelBuilder.Entity<Developer>(entity =>
        {
            entity.HasIndex(e => e.Email, "UQ_developers_email").IsUnique();
        });

         modelBuilder.Entity<AssignmentInfo>(entity =>
        {
            entity.HasNoKey();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
