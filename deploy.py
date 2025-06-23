import os
import subprocess
import time
import json
import xml.etree.ElementTree as ET


SIGNING_FILE = "signing_config.json"


def run_command(command, cwd=None):
    print(f">>> {command}")
    result = subprocess.run(command, shell=True, cwd=cwd)
    if result.returncode != 0:
        raise Exception(f"❌ Command failed: {command}")


def get_package_name(config_path):
    try:
        tree = ET.parse(config_path)
        root = tree.getroot()
        package_name = root.attrib.get("id")
        if not package_name:
            raise ValueError("❌ Package name not found in config.xml")
        print(f"📦 Found package name: {package_name}")
        return package_name
    except Exception as e:
        raise Exception(f"❌ Error reading config.xml: {e}")


def load_or_create_signing_config():
    if os.path.exists(SIGNING_FILE):
        with open(SIGNING_FILE, "r") as f:
            return json.load(f)

    print("🔐 First-time production build. Enter keystore signing info:")
    config = {
        "keystore_path": input("Keystore path (e.g., my-release-key.keystore): ").strip(),
        "alias": input("Key alias (e.g., myalias): ").strip(),
        "keystore_password": input("Keystore password: ").strip(),
        "alias_password": input("Key alias password: ").strip(),
    }

    with open(SIGNING_FILE, "w") as f:
        json.dump(config, f, indent=2)
        print(f"✅ Saved signing config to {SIGNING_FILE}")
    return config


def sign_and_align_apk(apk_unsigned_path, apk_output_path, config):
    print("🔐 Signing APK...")
    jarsigner_cmd = (
        f'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 '
        f'-keystore "{config["keystore_path"]}" '
        f'-storepass "{config["keystore_password"]}" '
        f'-keypass "{config["alias_password"]}" '
        f'"{apk_unsigned_path}" {config["alias"]}'
    )
    run_command(jarsigner_cmd)

    print("📦 Aligning APK...")
    zipalign_cmd = f'zipalign -v 4 "{apk_unsigned_path}" "{apk_output_path}"'
    run_command(zipalign_cmd)

    print(f"✅ Production APK ready: {apk_output_path}")


def install_apk_to_device(apk_path):
    print("📱 Installing APK to connected Android device...")
    run_command(f'adb install -r "{apk_path}"')
    print("✅ APK installed successfully!")


def launch_app_on_device(package_name):
    print(f"🚀 Launching app {package_name} on device...")
    run_command(f'adb shell monkey -p {package_name} -c android.intent.category.LAUNCHER 1')
    print("✅ App launched successfully!")


def git_commit(repo_path):
    print("\n📝 GIT COMMIT STEP")
    commit_message = input("Enter git commit message (or leave blank to skip): ").strip()
    if not commit_message:
        print("⚠️ Skipping commit.")
        return

    run_command("git add .", cwd=repo_path)
    result = subprocess.run("git status --porcelain", shell=True, cwd=repo_path, capture_output=True, text=True)
    if not result.stdout.strip():
        print("ℹ️ Nothing to commit.")
        return

    run_command(f'git commit -m "{commit_message}"', cwd=repo_path)
    print("✅ Changes committed.")


def find_apk(cordova_path, build_type="debug"):
    folder = "release" if build_type == "release" else "debug"
    apk_dir = os.path.join(cordova_path, "platforms", "android", "app", "build", "outputs", "apk", folder)
    if not os.path.exists(apk_dir):
        raise FileNotFoundError("❌ APK build folder not found.")

    for file in os.listdir(apk_dir):
        if file.endswith(".apk"):
            apk_path = os.path.join(apk_dir, file)
            print(f"📦 Found APK: {apk_path}")
            return apk_path

    raise FileNotFoundError("❌ No APK found in expected folder.")


def open_apk_folder_and_whatsapp(apk_path):
    subprocess.Popen(["cmd", "/c", "start", "whatsapp:"])
    time.sleep(2)
    apk_folder = os.path.dirname(apk_path)
    subprocess.run(["explorer", apk_folder])
    print(f"📂 Opened APK folder: {apk_folder}")


def main():
    project_path = os.getcwd()
    cordova_path = os.path.join(project_path, "cordova")
    config_path = os.path.join(cordova_path, "config.xml")

    if not os.path.exists(cordova_path):
        print("❌ 'cordova' folder not found inside the current directory.")
        return

    package_name = get_package_name(config_path)

    git_commit(project_path)

    choice = input(
        "\nBuild type?\n1️⃣ Debug (Test on device)\n2️⃣ Production (Signed APK)\nEnter choice (1 or 2): "
    ).strip()

    print("🏗️ Building React (Vite) app...")
    run_command("npm run build", cwd=project_path)

    if choice == "1":
        print("📦 Building Cordova DEBUG APK...")
        run_command("cordova build android", cwd=cordova_path)
        apk_path = find_apk(cordova_path, "debug")

    elif choice == "2":
        print("📦 Building Cordova RELEASE APK...")
        run_command("cordova build android --release", cwd=cordova_path)

        unsigned_apk = find_apk(cordova_path, "release")
        output_apk = os.path.join(project_path, "app-release.apk")
        signing_config = load_or_create_signing_config()
        sign_and_align_apk(unsigned_apk, output_apk, signing_config)

        apk_path = output_apk

    else:
        print("🚫 Invalid choice. Exiting.")
        return

    deploy_choice = input(
        "\nDeploy?\n1️⃣ Install on connected device\n2️⃣ Just open APK folder and WhatsApp\nEnter choice: "
    ).strip()

    if deploy_choice == "1":
        install_apk_to_device(apk_path)
        launch_app_on_device(package_name)
    else:
        open_apk_folder_and_whatsapp(apk_path)

    print("\n✅ All Done!")


if __name__ == "__main__":
    main()
