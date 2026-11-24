import {useEffect, useRef} from "react";

const previewReady = "HOMEPAGE_PREVIEW_READY";

export const useHomepagePreviewFrame = (type: string, settings: object) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const sendSettings = () => iframeRef.current?.contentWindow?.postMessage(
            {type, settings}, window.location.origin,
        );
        const handleReady = (event: MessageEvent) => {
            if (event.origin === window.location.origin && event.source === iframeRef.current?.contentWindow
                && event.data?.type === previewReady) {
                sendSettings();
            }
        };

        window.addEventListener("message", handleReady);
        sendSettings();
        return () => window.removeEventListener("message", handleReady);
    }, [type, settings]);

    return iframeRef;
};

export const useHomepagePreviewSettings = <Settings extends object>(
    type: string,
    applySettings: (settings: Settings) => void,
) => {
    useEffect(() => {
        if (window.parent === window) return;

        const handleSettings = (event: MessageEvent) => {
            if (event.origin === window.location.origin && event.source === window.parent
                && event.data?.type === type && event.data.settings) {
                applySettings(event.data.settings);
            }
        };
        window.addEventListener("message", handleSettings);
        window.parent.postMessage({type: previewReady}, window.location.origin);
        return () => window.removeEventListener("message", handleSettings);
    }, [type, applySettings]);
};
