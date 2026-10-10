import AccountPage from "@/components/account/AccountPage";
import PhoneFrame from "@/components/PhoneFrame";

export const dynamic = "force-dynamic";

export default function Account() {
  return (
    <PhoneFrame>
      <AccountPage />
    </PhoneFrame>
  );
}
