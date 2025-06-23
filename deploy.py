import os
import subprocess
import time
import json
import zipfile
import xml.etree.ElementTree as ET


SIGNING_FILE = "signing_config.json"
BUNDLETOOL_JAR = "bundletool.jar"  # Make sure this JAR is placed in the root directory

def convert_aab_to_apk(aab_path, config, output_apk_path):
    print("📦 Converting AAB to installable APK using bundletool...")

    apks_path = "app.apks"

    # Clean previous artifacts
    if os.path.exists(apks_path):
        os.remove(apks_path)
    if os.path.exists("extracted_apks"):
        import shutil
        shutil.rmtree("extracted_apks")

    build_apks_cmd = (
        f'java -jar {BUNDLETOOL_JAR} build-apks '
        f'--bundle="{aab_path}" '
        f'--output="{apks_path}" '
        f'--ks="{config["keystore_path"]}" '
        f'--ks-key-alias="{config["alias"]}" '
        f'--ks-pass=pass:{config["keystore_password"]} '
        f'--key-pass=pass:{config["alias_password"]} '
        f'--mode=universal '
        f'--overwrite'
    )
    run_command(build_apks_cmd)

    # Extract the universal.apk
    with zipfile.ZipFile(apks_path, 'r') as zip_ref:
        zip_ref.extractall('extracted_apks')

    universal_apk_path = os.path.join("extracted_apks", "universal.apk")
    if not os.path.exists(universal_apk_path):
        raise Exception("❌ Failed to find universal APK in .apks")

    os.rename(universal_apk_path, output_apk_path)
    print(f"✅ Converted AAB to APK: {output_apk_path}")


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


def sign_and_align_apk(input_path, output_path, config):
    if input_path.endswith(".apk"):
        print("🔐 Signing APK...")
        jarsigner_cmd = (
            f'jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 '
            f'-keystore "{config["keystore_path"]}" '
            f'-storepass "{config["keystore_password"]}" '
            f'-keypass "{config["alias_password"]}" '
            f'"{input_path}" {config["alias"]}'
        )
        run_command(jarsigner_cmd)

        print("📦 Aligning APK (zipalign)...")
        zipalign_cmd = f'zipalign -v 4 "{input_path}" "{output_path}"'
        run_command(zipalign_cmd)
        print(f"✅ Signed and aligned APK ready: {output_path}")

    elif input_path.endswith(".aab"):
        convert_aab_to_apk(input_path, config, output_path)
    else:
        raise Exception("❌ Unknown file type to sign.")



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

def find_apk_or_aab(cordova_path, build_type="release"):
    apk_dir = os.path.join(cordova_path, "platforms", "android", "app", "build", "outputs", "apk", build_type)
    bundle_dir = os.path.join(cordova_path, "platforms", "android", "app", "build", "outputs", "bundle", build_type)

    # Check for APK first
    if os.path.exists(apk_dir):
        for file in os.listdir(apk_dir):
            if file.endswith(".apk"):
                return os.path.join(apk_dir, file)

    # Check for AAB
    if os.path.exists(bundle_dir):
        for file in os.listdir(bundle_dir):
            if file.endswith(".aab"):
                return os.path.join(bundle_dir, file)

    raise FileNotFoundError("❌ No APK or AAB found.")


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
        apk_path = find_apk_or_aab(cordova_path, "debug")

    elif choice == "2":
        print("📦 Building Cordova RELEASE APK...")
        run_command("cordova build android --release", cwd=cordova_path)

        unsigned_apk = find_apk_or_aab(cordova_path, "release")
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
