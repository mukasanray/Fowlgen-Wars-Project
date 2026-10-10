import os

projects = {
    "Acesso": ["Domain", "Application", "Infra.Data", "Infra.Ioc", "Tests"],
    "Core": ["Domain", "Application", "Infra.IoC", "Resources", "Tests"],
    "Sistema": ["Domain", "Application", "Infra.Data", "Infra.IoC", "Tests"]
}

base_dir = "/home/marco/fowlgenwars/api/src/backend"

csproj_template = """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
"""

for mod in projects.keys():
    old_file = os.path.join(base_dir, mod, f"FowlgenWars.{mod}", f"FowlgenWars.{mod}.csproj")
    if os.path.exists(old_file):
        os.remove(old_file)

for mod, layers in projects.items():
    for layer in layers:
        proj_name = f"FowlgenWars.{mod}.{layer}"
        proj_dir = os.path.join(base_dir, mod, proj_name)
        os.makedirs(proj_dir, exist_ok=True)
        with open(os.path.join(proj_dir, f"{proj_name}.csproj"), "w") as f:
            f.write(csproj_template)
