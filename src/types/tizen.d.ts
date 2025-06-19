// Types pour l'API Tizen TV

export interface TizenDeviceInfo {
  model: string;
  version: string;
  duid: string;
  resolution: string;
}

export interface TizenWebAPIs {
  productinfo: {
    getModel(): string;
    getVersion(): string;
    getDuid(): string;
    getResolution(): string;
  };
  avplay: {
    setListener(listener: {
      onbufferingstart?: () => void;
      onbufferingprogress?: (percent: number) => void;
      onbufferingcomplete?: () => void;
      onstreamcompleted?: () => void;
      oncurrentplaytime?: (time: number) => void;
      onerror?: (error: unknown) => void;
    }): void;
  };
  appcommon: {
    getAppContext(): {
      exit(): void;
      setListener(listener: {
        onSuspend?: () => void;
        onResume?: () => void;
        onExit?: () => void;
      }): void;
    };
  };
}

declare global {
  interface Window {
    tizen?: unknown;
    webapis?: TizenWebAPIs;
  }
}

export {};
