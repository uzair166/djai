export interface Track {
  id: string;
  name: string;
  artists: {
    name: string;
  }[];
  album: {
    name: string;
    images: {
      url: string;
    }[];
  };
  external_urls: {
    spotify: string;
  };
}

export interface GeneratedPlaylist {
  playlistName: string;
  recommendations: Track[];
  playlist?: {
    id: string;
    name: string;
    description: string;
    external_urls: {
      spotify: string;
    };
  };
} 