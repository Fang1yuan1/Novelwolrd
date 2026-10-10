import EditProfile from "@/components/account/EditProfile";
import PhoneFrame from "@/components/PhoneFrame";

export const dynamic = "force-dynamic";

export default function EditProfilePage() {
  return (
    <PhoneFrame>
      <EditProfile />
    </PhoneFrame>
  );
}
