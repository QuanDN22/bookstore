# Step 1: Assume role or get session token
# Use AWS CLI to assume role and get temporary credentials

$assumeRoleOutput = aws sts assume-role `
    --role-arn arn:aws:iam::432590225625:role/PowerUser `
    --role-session-name my-session `
    --profile my_admin_role

# Alternatively, use session token if needed
# $sessionTokenOutput = aws sts get-session-token `
#     --serial-number arn:aws:iam::432590225625:mfa/anm-quandn2 `
#     --token-code 001391 `
#     --profile my_admin_role

# Step 2: Extract temporary credentials (AccessKeyId, SecretAccessKey, SessionToken)
$accessKeyId = ($assumeRoleOutput | ConvertFrom-Json).Credentials.AccessKeyId
$secretAccessKey = ($assumeRoleOutput | ConvertFrom-Json).Credentials.SecretAccessKey
$sessionToken = ($assumeRoleOutput | ConvertFrom-Json).Credentials.SessionToken

# Alternatively, use session token if using get-session-token
# $accessKeyId = ($sessionTokenOutput | ConvertFrom-Json).Credentials.AccessKeyId
# $secretAccessKey = ($sessionTokenOutput | ConvertFrom-Json).Credentials.SecretAccessKey
# $sessionToken = ($sessionTokenOutput | ConvertFrom-Json).Credentials.SessionToken

# Step 3: Set the temporary credentials as environment variables
$env:AWS_ACCESS_KEY_ID = $accessKeyId
$env:AWS_SECRET_ACCESS_KEY = $secretAccessKey
$env:AWS_SESSION_TOKEN = $sessionToken

# Step 4: Run AWS CLI commands to delete the role policy and related resources
Write-Host "Detaching the policy LookupRolePolicy from the role..."
aws iam detach-role-policy --role-name cdk-hnb659fds-lookup-role-432590225625-ap-southeast-1 --policy-arn arn:aws:iam::432590225625:policy/LookupRolePolicy --region ap-southeast-1

Write-Host "Deleting the role cdk-hnb659fds-lookup-role-432590225625-ap-southeast-1..."
aws iam delete-role --role-name cdk-hnb659fds-lookup-role-432590225625-ap-southeast-1 --region ap-southeast-1

Write-Host "Deleting policy LookupRolePolicy..."
aws iam delete-policy --policy-arn arn:aws:iam::432590225625:policy/LookupRolePolicy --region ap-southeast-1

# Step 5: Unset environment variables after the operation
Remove-Item Env:AWS_ACCESS_KEY_ID
Remove-Item Env:AWS_SECRET_ACCESS_KEY
Remove-Item Env:AWS_SESSION_TOKEN

Write-Host "Done! Temporary credentials have been cleared."
