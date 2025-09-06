namespace ProjectManagement.API.Models
{
    public class AssignmentInfo
    {
        public int developer_id { get; set; }
        public string full_name { get; set; } = null!;
        public string email { get; set; } = null!;
        public string seniority { get; set; } = null!;
        public string role { get; set; } = null!;
        public int weekly_hours { get; set; }
        public DateTime assignment_date { get; set; }
    }
}