import os
import json
import sys

def get_directory_structure(root_dir, ignore_list=None):
    if ignore_list is None:
        ignore_list = []

    directory_structure = {}

    for item in os.listdir(root_dir):
        if item in ignore_list:
            continue

        item_path = os.path.join(root_dir, item)

        if os.path.isdir(item_path):
            directory_structure[item] = get_directory_structure(item_path, ignore_list)
        elif os.path.isfile(item_path):
            try:
                with open(item_path, 'r', encoding='utf-8') as file:
                    directory_structure[item] = file.read()
            except UnicodeDecodeError:
                directory_structure[item] = "Unable to decode file with utf-8 encoding."

    return directory_structure

def main():
    if len(sys.argv) > 1:
        root_directory = sys.argv[1]
    else:
        root_directory = input("Enter the path of the directory you want to export (default: current directory): ").strip() or os.getcwd()

    if not os.path.exists(root_directory):
        print("❌ The provided directory does not exist.")
        return

    # Add items you want to ignore here
    ignore_list = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.DS_Store', 'cordova', 'README.md', 'package-lock.json', '.gitignore', 'public', 'export_this.py', 'directory_structure.json']

    result = get_directory_structure(root_directory, ignore_list)
    result_json = json.dumps(result, indent=4)

    output_path = os.path.join(os.getcwd(), "directory_structure.json")
    with open(output_path, 'w', encoding='utf-8') as json_file:
        json_file.write(result_json)

    print(f"✅ Directory structure saved to {output_path}")

if __name__ == "__main__":
    main()
