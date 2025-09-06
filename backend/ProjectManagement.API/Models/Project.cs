using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ProjectManagement.API.Models;

[Table("projects")]
public partial class Project
{
    [Key]
    [Column("project_id")]
    public int ProjectId { get; set; }

    [Required]
    [Column("name")]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Column("client")]
    [StringLength(200)]
    public string? Client { get; set; }

    [Column("start_date", TypeName = "date")]
    public DateTime StartDate { get; set; }

    [Column("end_date", TypeName = "date")]
    public DateTime? EndDate { get; set; }

    [Required]
    [Column("status")]
    [StringLength(20)]
    public string Status { get; set; } = null!;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; }

    [InverseProperty("Project")]
    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}