export interface NodeData {
  id: string;
  name: string;
  followers: number;
  category: string;
  handle?: string;
  bio?: string;
}

export interface LinkData {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "James",
  "Isabella", "Oliver", "Mia", "Benjamin", "Evelyn", "Elijah", "Harper",
  "Lucas", "Camila", "Mason", "Gianna", "Logan", "Abigail", "Alexander",
  "Luna", "Ethan", "Ella", "Jacob", "Elizabeth", "Michael", "Sofia", "Daniel",
  "Emily", "Henry", "Avery", "Jackson", "Mila", "Sebastian", "Aria", "Aiden",
  "Scarlett", "Matthew", "Penelope", "Samuel", "Layla", "David", "Chloe",
  "Joseph", "Victoria", "Carter", "Madison", "Owen"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
  "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall",
  "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
];

const CATEGORIES = [
  "Grammar Expert",
  "Pronunciation Coach",
  "IELTS/TOEFL Prep",
  "Everyday Slang",
  "Business English"
];

function generateMockData(): GraphData {
  const nodes: NodeData[] = [];
  const links: LinkData[] = [];

  // Generate 50 nodes
  for (let i = 0; i < 50; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    
    nodes.push({
      id: `user_${i}`,
      name: `${firstName} ${lastName}`,
      followers: Math.floor(Math.random() * 950000) + 50000, // 50k to 1M followers
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    });
  }

  // Sort nodes by followers descending to easily identify top influencers
  nodes.sort((a, b) => b.followers - a.followers);

  // Generate links (relationships)
  // Prefer linking to top influencers to create a realistic network structure
  nodes.forEach((node, index) => {
    // Each person follows 2 to 8 others
    const numFollowing = Math.floor(Math.random() * 7) + 2;
    
    for (let i = 0; i < numFollowing; i++) {
      // 70% chance to follow a top 10 influencer, 30% chance to follow anyone
      const targetIndex = Math.random() < 0.7 
        ? Math.floor(Math.random() * Math.min(10, nodes.length)) // Top influencers
        : Math.floor(Math.random() * nodes.length); // Anyone
        
      if (node.id !== nodes[targetIndex].id) {
        // Prevent duplicate links
        const exists = links.some(l => l.source === node.id && l.target === nodes[targetIndex].id);
        if (!exists) {
          links.push({
            source: node.id,
            target: nodes[targetIndex].id
          });
        }
      }
    }
  });

  return { nodes, links };
}

export const mockData = generateMockData();
