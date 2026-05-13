export interface IDisease {
  _id: string;
  name: string;        
  fishType: string;      
  imageUrl: string;      
  description: string;  
  causes: string[];      
  prevention: string[];  
  solution: string[];    
  medicines: string[];   
  riskLevel: 'low' | 'medium' | 'high';
}