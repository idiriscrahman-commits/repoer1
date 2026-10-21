import os
import zipfile
import shutil

EXCLUDE_DIRS = {'node_modules', '.git', '.playwright-cli', '.aistudio', '__pycache__', 'dist'}
EXCLUDE_FILES = {'.DS_Store'}

def create_zip(output_path, base_dir='.'):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if file in EXCLUDE_FILES or file.endswith('.zip'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                zipf.write(full_path, os.path.join('report-management-system', rel_path))

if __name__ == '__main__':
    root_zip = 'report-management-system.zip'
    public_zip = 'public/report-management-system.zip'
    create_zip(root_zip)
    create_zip(public_zip)
    size_mb = os.path.getsize(root_zip) / (1024 * 1024)
    print(f"ZIP created successfully: {root_zip} ({size_mb:.2f} MB)")
