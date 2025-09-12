
export interface Source {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sources?: Source[];
}
