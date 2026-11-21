import {Button, ButtonProps} from '@mantine/core';
import {IconDownload} from '@tabler/icons-react';
import {t} from '@lingui/macro';

interface DownloadCsvButtonProps extends Omit<ButtonProps, 'onClick'> {
    headers: string[];
    data: (string | number)[][];
    filename?: string;
}

export const DownloadCsvButton = ({
                                      headers,
                                      data,
                                      filename = 'download.csv',
                                      ...buttonProps
                                  }: DownloadCsvButtonProps) => {
    const handleDownloadCSV = () => {
        const escapeCell = (value: string | number) => {
            if (typeof value === 'number') return value.toString();
            const safeText = /^\s*[=+@-]/.test(value) && !/^-?\d+(?:\.\d+)?$/.test(value)
                ? "'" + value : value;
            return '"' + safeText.replaceAll('"', '""') + '"';
        };
        const csv = [headers, ...data].map(row => row.map(escapeCell).join(',')).join('\r\n');
        const blob = new Blob(['\uFEFF', csv], {type: 'text/csv;charset=utf-8'});
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Button
            leftSection={<IconDownload size={16}/>}
            onClick={handleDownloadCSV}
            variant="light"
            {...buttonProps}
        >
            {t`Download CSV`}
        </Button>
    );
};
