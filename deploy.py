import os
import subprocess
import time

def run_command(command, cwd=None):
    print(f">>> {command}")
    result = subprocess.run(command, shell=True, cwd=cwd)
    if result.returncode != 0:
        raise Exception(f"❌ Command failed: {command}")


def install_apk_to_device(apk_path):
    print("📱 Installing APK to connected Android device...")
    try:
        run_command(f'adb install -r "{apk_path}"')  # -r for reinstall if already installed
        print("✅ APK installed successfully!")
    except Exception as e:
        print("❌ Failed to install APK:", e)


def git_commit(repo_path):
    print("\n📝 GIT COMMIT STEP")
    commit_message = input("Enter git commit message (or leave blank to skip): ").strip()
    if not commit_message:
        print("⚠️ Skipping commit.")
        return False

    run_command("git add .", cwd=repo_path)

    result = subprocess.run("git status --porcelain", shell=True, cwd=repo_path, capture_output=True, text=True)
    if not result.stdout.strip():
        print("ℹ️ Nothing to commit.")
        return False

    run_command(f'git commit -m "{commit_message}"', cwd=repo_path)
    print("✅ Changes committed.")
    return True

def find_apk(cordova_path):
    apk_dir = os.path.join(cordova_path, "platforms", "android", "app", "build", "outputs", "apk", "debug")
    if not os.path.exists(apk_dir):
        raise FileNotFoundError("❌ APK build folder not found.")

    for file in os.listdir(apk_dir):
        if file.endswith(".apk"):
            apk_path = os.path.join(apk_dir, file)
            print(f"📦 Found APK: {apk_path}")
            return apk_path

    raise FileNotFoundError("❌ No APK found in debug folder.")

def open_whatsapp_and_apk_folder(apk_path):
    try:
        subprocess.Popen(["cmd", "/c", "start", "whatsapp:"])
        print("🟢 Opened WhatsApp Desktop.")
    except Exception as e:
        print("⚠️ Could not open WhatsApp:", e)

    time.sleep(2)

    apk_folder = os.path.dirname(apk_path)
    subprocess.run(["explorer", apk_folder])
    print(f"📂 Opened APK folder: {apk_folder}")

def main():
    # Automatically take the current directory
    project_path = os.getcwd()
    print(f"📁 Current project directory: {project_path}")

    cordova_path = os.path.join(project_path, "cordova")
    if not os.path.exists(cordova_path):
        print("❌ 'cordova' folder not found inside the current directory.")
        return

    # Git commit
    git_commit(project_path)

    deploy = input("\nDo you want to build and deploy APK? (y/n): ").strip().lower()
    if deploy != "y":
        print("🚫 Build skipped.")
        return

    print("🏗️ Building Vite project...")
    run_command("npm run build", cwd=project_path)

    print("📦 Building Cordova APK...")
    run_command("cordova build android", cwd=cordova_path)

    print("🔍 Locating APK...")
    apk_path = find_apk(cordova_path)

    print("📲 Installing APK directly to device...")
    install_apk_to_device(apk_path)


    print("\n✅ Done!")

if __name__ == "__main__":
    main()
