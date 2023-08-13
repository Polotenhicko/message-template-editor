import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';
import styles from './TextArea.module.css';
import { TSetLastFocusedInput } from '../../components/MessageEditor/MessageEditor';

interface ITextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  autoResize?: boolean;
  onFocusInput?: TSetLastFocusedInput;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  textAreaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function TextArea({
  className,
  onFocusInput,
  textAreaRef,
  autoResize = true,
  onChange,
  ...other
}: ITextAreaProps) {
  const [minHeight, setMinHeight] = useState<null | number>(null);

  const classNames = cn(styles.textarea, className);

  let ref = useRef<HTMLTextAreaElement>(null);
  if (textAreaRef) ref = textAreaRef;

  // auto resize
  useLayoutEffect(() => {
    if (!autoResize) return;
    if (!ref || !ref.current) return;
    if (!(ref.current instanceof HTMLTextAreaElement)) return;

    const textAreaEl = ref.current;
    const { offsetHeight, clientHeight } = textAreaEl;

    textAreaEl.style.height = '0';

    // set height 0, to install later scrollHeight
    if (!minHeight) {
      // First text input, save minimum height so textarea doesn't jump
      const currentHeight = offsetHeight;
      textAreaEl.style.height = currentHeight + 5 + 'px';
      setMinHeight(currentHeight);
    } else {
      // leftHeight is needed because scrollHeight with min-height == clientHeight
      const leftHeight = offsetHeight - clientHeight;
      const currentHeight = textAreaEl.scrollHeight - leftHeight;
      textAreaEl.style.height = (currentHeight < minHeight ? minHeight : currentHeight) + 5 + 'px';
    }
  });

  // disable repeat key according to the terms of reference
  const handleKeyDownRepeat = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (other.onKeyDown) other.onKeyDown(e);

    // other than these buttons
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (e.repeat && !allowedKeys.includes(e.key)) e.preventDefault();
  };

  // set lastFocused input to current element
  const handleOnFocus = () => {
    if (!onFocusInput) return;
    if (!ref || !ref.current) return;

    onFocusInput(ref.current);
  };

  return (
    <textarea
      className={classNames}
      onChange={onChange}
      onKeyDown={handleKeyDownRepeat}
      ref={ref}
      onFocus={handleOnFocus}
      {...other}
    ></textarea>
  );
}
