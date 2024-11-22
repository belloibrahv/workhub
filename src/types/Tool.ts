export interface Tool {
  id: string;
  name: string;
  type: 'hardware' | 'software';
  quantity: number;
}
