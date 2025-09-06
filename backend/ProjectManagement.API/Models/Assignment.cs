using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProjectManagement.API.Models
{
    public class Assignment
    {
        [Key]
        [Column("project_id")]
        public int ProjectId { get; set; }

        [Key]
        [Column("developer_id")]
        public int DeveloperId { get; set; }

        [Column("role")]
        [Required]
        [StringLength(50)]
        public string Role { get; set; } = string.Empty;

        [Column("weekly_hours")]
        [Range(1, 40)]
        public int WeeklyHours { get; set; }

        [Column("assignment_date")]
        public DateTime AssignmentDate { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [ForeignKey("DeveloperId")]
        public virtual Developer? Developer { get; set; }
    }
}