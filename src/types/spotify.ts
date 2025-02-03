export interface SpotifyTrack {
  id: string;
  name: string;
  artists: {
    id: string;
    name: string;
  }[];
  album: {
    id: string;
    name: string;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
  };
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
  uri: string;
  explicit: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  tracks: {
    total: number;
    items: {
      track: SpotifyTrack;
    }[];
  };
}

export interface SpotifyTrackWithReason {
  track: SpotifyTrack;
  reason: string;
}

export interface PlaylistHistoryItem {
  id: string;
  timestamp: number;
  seedTracks: SpotifyTrack[];
  prompt: string;
  numberOfTracks: number;
  generatedPlaylist: GenerationResult | null;
}

export interface GenerationResult {
  playlist?: SpotifyPlaylist;
  tracks: SpotifyTrackWithReason[];
  playlistName: string;
} 