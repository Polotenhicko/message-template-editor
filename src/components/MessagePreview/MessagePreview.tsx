import styles from './MessagePreview.module.css';
import { Modal } from '../Modal';
import { TArrVarNames } from '../VarNameList/VarNameList';
import { ITemplate } from '../../services/template.service';
import { ReactComponent as CloseSvg } from '../../assets/icons/close.svg';
import { PreviewVariableList } from '../PreviewVariableList';
import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../controls/Button';
import previewMessageService from '../../services/previewMessage.service';

interface IMessagePreviewProps {
  arrVarNames: TArrVarNames;
  template: ITemplate;
  onClose: () => void;
}

export type THandleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => void;

export function MessagePreview({ arrVarNames, template: sample, onClose }: IMessagePreviewProps) {
  const messagePreviewRef = useRef<HTMLDivElement | null>(null);

  const [message, setMessage] = useState('');
  const [isRendered, setIsRendered] = useState(false);

  useLayoutEffect(() => {
    setIsRendered(true);
    previewMessageService.setVariables(sample, arrVarNames);
    setMessage(previewMessageService.getMessage());

    return () => {
      previewMessageService.clearVariables();
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleClickOutsideModal = (e: React.MouseEvent<Node>) => {
    if (!messagePreviewRef.current) return;
    if (!(e.target instanceof Node)) return;

    if (!messagePreviewRef.current.contains(e.target)) {
      handleClose();
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMessage(previewMessageService.getMessage({ name, value }));
  };

  const modalStyle = {
    opacity: isRendered ? 1 : 0,
  };

  return (
    <Modal>
      <div className={styles.modal} onClick={handleClickOutsideModal} style={modalStyle}>
        <div className={styles.messagePreview} ref={messagePreviewRef}>
          <h2 className={styles.title}>Message Preview</h2>
          <div className={styles.message}>{message}</div>
          <PreviewVariableList arrVarNames={arrVarNames} onChangeInput={handleChangeInput} />
          <Button className={styles.actionPanelCloseBtn} onClick={handleClose}>
            Close
          </Button>
          <CloseSvg className={styles.closeBtn} onClick={handleClose} />
        </div>
      </div>
    </Modal>
  );
}