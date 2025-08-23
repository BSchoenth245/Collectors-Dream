; MongoDB Installation Instructions Screen for NSIS Installer

!include "MUI2.nsh"

; Custom page for MongoDB instructions
Page custom MongoDBInstructionsPage MongoDBInstructionsPageLeave

; Variables
Var MongoDBDialog
Var MongoDBLabel1
Var MongoDBLabel2
Var MongoDBLabel3
Var MongoDBLabel4
Var MongoDBLabel5
Var MongoDBLink

; MongoDB Instructions Page
Function MongoDBInstructionsPage
  !insertmacro MUI_HEADER_TEXT "MongoDB Installation Required" "Please install MongoDB before continuing"
  
  nsDialogs::Create 1018
  Pop $MongoDBDialog
  
  ${If} $MongoDBDialog == error
    Abort
  ${EndIf}
  
  ; Title
  ${NSD_CreateLabel} 0 0 100% 20u "MongoDB Community Server is required for Collector's Dream to function."
  Pop $MongoDBLabel1
  
  ; Instructions
  ${NSD_CreateLabel} 0 30u 100% 20u "Please follow these steps to install MongoDB:"
  Pop $MongoDBLabel2
  
  ${NSD_CreateLabel} 10u 55u 100% 20u "1. Download MongoDB Community Server from the link below"
  Pop $MongoDBLabel3
  
  ${NSD_CreateLabel} 10u 75u 100% 20u "2. Run the installer and choose 'Complete' installation"
  Pop $MongoDBLabel4
  
  ${NSD_CreateLabel} 10u 95u 100% 20u "3. Make sure 'Install MongoDB as a Service' is checked"
  Pop $MongoDBLabel5
  
  ; Download link
  ${NSD_CreateLink} 10u 120u 100% 20u "https://www.mongodb.com/try/download/community"
  Pop $MongoDBLink
  ${NSD_OnClick} $MongoDBLink OpenMongoDBLink
  
  ; Warning
  ${NSD_CreateLabel} 0 150u 100% 40u "Important: You must install MongoDB before clicking Next. The application will not work without MongoDB installed and running."
  Pop $MongoDBLabel1
  
  nsDialogs::Show
FunctionEnd

; Handle MongoDB link click
Function OpenMongoDBLink
  ExecShell "open" "https://www.mongodb.com/try/download/community"
FunctionEnd

; Validate MongoDB installation before proceeding
Function MongoDBInstructionsPageLeave
  ; Check if MongoDB is installed by looking for mongod.exe
  IfFileExists "$PROGRAMFILES\MongoDB\Server\*\bin\mongod.exe" mongodb_found
  IfFileExists "$PROGRAMFILES64\MongoDB\Server\*\bin\mongod.exe" mongodb_found
  
  ; MongoDB not found - show warning
  MessageBox MB_YESNO|MB_ICONQUESTION "MongoDB was not detected on your system.$\n$\nAre you sure you want to continue? The application will not work without MongoDB." IDYES mongodb_found
  Abort
  
  mongodb_found:
FunctionEnd