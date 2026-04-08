Option Explicit

Dim shell
Dim fso
Dim scriptDir
Dim psScript
Dim command

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
psScript = scriptDir & "\launch-history-tool.ps1"

command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & psScript & """ -HiddenWorker"
shell.Run command, 0, False
