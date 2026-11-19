export type ResponsibilityTemplate = {
  key: string;
  name: string;
  description: string;
  tasks: string[];
  procedures: string[];
  skills: string[];
  suggestedTools: string[];
};

export type DepartmentTemplate = {
  key: string;
  name: string;
  description: string;
  responsibilities: ResponsibilityTemplate[];
};

export const DEPARTMENT_CATALOG: DepartmentTemplate[] = [
  {
    key: "human-resources",
    name: "Human Resources",
    description: "Manages the company's workforce and employee development.",
    responsibilities: [
      {
        key: "recruitment",
        name: "Recruitment & Hiring",
        description: "Identify, evaluate, and recommend employees.",
        tasks: [
          "Identify staffing needs",
          "Define position requirements",
          "Evaluate candidates",
          "Recommend hiring decisions"
        ],
        procedures: [],
        skills: [],
        suggestedTools: []
      },
      {
        key: "employee-relations",
        name: "Employee Relations",
        description: "Support communication and resolve workplace concerns.",
        tasks: [
          "Review employee concerns",
          "Recommend conflict resolutions",
          "Identify workplace culture problems"
        ],
        procedures: [],
        skills: [],
        suggestedTools: []
      },
      {
        key: "performance-management",
        name: "Performance Management",
        description: "Evaluate employee effectiveness and improvement opportunities.",
        tasks: [
          "Review employee performance",
          "Identify recurring failures",
          "Recommend performance improvements",
          "Identify training needs"
        ],
        procedures: [],
        skills: [],
        suggestedTools: []
      },
      {
        key: "compensation-benefits",
        name: "Compensation & Benefits",
        description: "Develop and review employee compensation policies.",
        tasks: [
          "Review compensation structures",
          "Evaluate benefits programs",
          "Recommend compensation adjustments"
        ],
        procedures: [],
        skills: [],
        suggestedTools: []
      }
    ]
  },
  {
    key: "project-program-management",
    name: "Project & Program Management",
    description: "Coordinates projects, programs, resources, and delivery.",
    responsibilities: [
      {
        key: "project-management",
        name: "Project Manager",
        description: "Plan, coordinate, and deliver individual projects.",
        tasks: [
          "Define project objectives",
          "Research project requirements",
          "Break projects into tasks",
          "Delegate and track work",
          "Review deliverables",
          "Report progress and risks"
        ],
        procedures: [],
        skills: [],
        suggestedTools: []
      },
      {
        key: "program-management",
        name: "Program Manager",
        description: "Coordinate related projects toward strategic outcomes.",
        tasks: [
          "Coordinate related projects",
          "Manage cross-project dependencies",
          "Evaluate program risks",
          "Report program performance"
        ],
        procedures: [],
        skills: [],
        suggestedTools: []
      },
      {
        key: "project-coordination",
        name: "Project Coordinator",
        description: "Support project scheduling, documentation, and communication.",
        tasks: [
          "Maintain project documentation",
          "Track milestones and deadlines",
          "Coordinate project communications",
          "Follow up on outstanding tasks"
        ],
        procedures: [],
        skills: [],
        suggestedTools: []
      }
    ]
  }
];
