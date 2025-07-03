import NotificationToast from "@/components/NotificationToast";
import { Provider } from "react-redux";
import { InitializationWrapper } from "../components/InitializationWrapper";
import store from "./index";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NotificationToast disabledPath={["/test/start"]} />
      <InitializationWrapper>{children}</InitializationWrapper>
    </Provider>
  );
}
