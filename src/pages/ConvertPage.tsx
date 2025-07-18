    import React, { useState, useRef } from 'react';
    import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
    import '../style/ConvertPage.css';

    const ffmpeg = createFFmpeg({
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js', // Đường dẫn tương đối trong public/
    });
    const ConvertPage: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const targetFormatRef = useRef<'mp4' | 'avi'>('mp4');

    const loadFFmpeg = async () => {
        if (!ffmpeg.isLoaded()) {
        try {
            await ffmpeg.load();
        } catch (err) {
            throw new Error('Không thể tải FFmpeg: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
        }
    };

    const handleConvert = async () => {
        if (!videoFile) {
        setError('Vui lòng chọn video .mp4 hoặc .avi');
        return;
        }

        const ext = videoFile.name.split('.').pop()?.toLowerCase();
        if (ext !== 'mp4' && ext !== 'avi') {
        setError('Chỉ hỗ trợ định dạng .mp4 hoặc .avi');
        return;
        }

        setIsLoading(true);
        setError(null);
        setConvertedUrl(null);

        try {
        await loadFFmpeg();

        const inputName = `input.${ext}`;
        const outputName = `output.${ext === 'mp4' ? 'avi' : 'mp4'}`;
        targetFormatRef.current = ext === 'mp4' ? 'avi' : 'mp4';

        ffmpeg.FS('writeFile', inputName, await fetchFile(videoFile));
        await ffmpeg.run(
            '-i',
            inputName,
            '-c:v',
            ext === 'mp4' ? 'mpeg4' : 'libx264',
            '-c:a',
            'aac',
            outputName
        );

        const data = ffmpeg.FS('readFile', outputName);
        const blob = new Blob([data], {
            type: targetFormatRef.current === 'mp4' ? 'video/mp4' : 'video/avi',
        });
        const url = URL.createObjectURL(blob);
        setConvertedUrl(url);

        ffmpeg.FS('unlink', inputName);
        ffmpeg.FS('unlink', outputName);
        } catch (err) {
        setError('Lỗi khi chuyển đổi video: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <div className="convert-page">
        <h2>🎞️ Chuyển đổi video MP4 ⇄ AVI</h2>
        <div className="input-group">
            <input
            type="file"
            accept="video/mp4,video/avi"
            onChange={(e) => {
                setVideoFile(e.target.files?.[0] || null);
                setConvertedUrl(null);
                setError(null);
                if (convertedUrl) URL.revokeObjectURL(convertedUrl);
            }}
            className="file-input"
            />
            <button
            className="btn btn-primary"
            onClick={handleConvert}
            disabled={isLoading || !videoFile}
            >
            {isLoading
                ? 'Đang chuyển đổi...'
                : videoFile
                ? `Chuyển sang ${videoFile.name.split('.').pop()?.toLowerCase() === 'mp4' ? 'AVI' : 'MP4'}`
                : 'Chuyển đổi'}
            </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {convertedUrl && (
            <div className="video-output">
            <video controls src={convertedUrl} className="video-preview" />
            <div className="download-link">
                <a
                href={convertedUrl}
                download={`converted.${targetFormatRef.current}`}
                className="btn btn-success"
                >
                ⬇️ Tải video đã chuyển đổi
                </a>
            </div>
            </div>
        )}
        {isLoading && (
            <div className="loading-overlay">
            <div className="loading-spinner"></div>
            </div>
        )}
        </div>
    );
    };

    export default ConvertPage;