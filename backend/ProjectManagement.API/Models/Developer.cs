using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace ProjectManagement.API.Models;

[Table("developers")]
public partial class Developer
{
    [Key]
    [Column("developer_id")]
    public int DeveloperId { get; set; }

    [Required]
    [Column("full_name")]
    [StringLength(200)]
    public string FullName { get; set; } = null!;

    [Required]
    [Column("email")]
    [StringLength(200)]
    public string Email { get; set; } = null!;

    [Required]
    [Column("seniority")]
    [StringLength(10)]
    public string Seniority { get; set; } = null!;

    [Column("is_active")]
    public bool IsActive { get; set; }

    [InverseProperty("Developer")]
    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
}