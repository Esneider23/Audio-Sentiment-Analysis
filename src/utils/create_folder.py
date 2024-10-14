"""
Create a folder if it does not exist
"""
import os


def create_temp_folder(folder_name="tmp"):
    """
    Creates a temporary folder if it doesn't exist.

    :param folder_name: The name of the folder to create. Defaults to 'tmp'.
    :return: The path to the created folder.
    """
    os.makedirs(folder_name, exist_ok=True)
    return folder_name


def get_temp_file_path(folder_name, file_name):
    """
    Generates a file path inside the temporary folder.

    :param folder_name: The name of the folder.
    :param file_name: The name of the file.
    :return: The full path to the file.
    """
    return os.path.join(folder_name, file_name)
