import React from 'react';
import { Colors, Incubator } from 'react-native-ui-lib';

export type ToasterContextProps = {
  addToast: (props: Incubator.ToastProps) => void;
};

export const ToasterContext = React.createContext<ToasterContextProps>({
  addToast: () => {},
});

export const ToasterProvider: React.FC = ({ children }) => {
  const [toasts, setToasts] = React.useState<Incubator.ToastProps[]>([]);

  const RenderToasts = React.useCallback(() => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Incubator.Toast key={`t-${Math.random()}`} {...toasts[0]} visible style={{ borderWidth: 2, borderColor: Colors.$outlineNeutral }} />
  ), [toasts]);

  const handlers = (toast: Incubator.ToastProps): Incubator.ToastProps => ({
    ...toast,
    autoDismiss: 3000,
    visible: false,
    onDismiss: () => setToasts((prevState) => [
      ...prevState.filter((item) => item.message !== toast.message),
    ]),
  });
  const addToast = (props: Incubator.ToastProps) => setToasts(
    (prevState) => [...prevState, handlers(props)],
  );

  React.useEffect(() => {
    console.log('toasts in Q', toasts.length);
  }, [toasts]);

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ToasterContext.Provider value={{ addToast }}>
      <>
        {children}
        {toasts.length > 0 && <RenderToasts />}
      </>
    </ToasterContext.Provider>
  );
};
