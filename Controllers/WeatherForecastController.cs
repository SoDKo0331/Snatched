using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using Dapper;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace aka.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet, Authorize, Route("info")]
    public IActionResult Get()
    {
        var sds = _configuration.GetConnectionString("DefaultConnection");

        using (SqlConnection connection = new SqlConnection(sds))
        {
            return Ok(connection.Query("select * from Registeration").AsList());
        }
    }
    [HttpGet, Authorize, Route("user")]
    public new IActionResult User(int id)
    {
        var sds = _configuration.GetConnectionString("DefaultConnection");

        Console.Write(" Backend user");

        using (SqlConnection connection = new SqlConnection(sds))
        {
            // You can use the parameterName in your SQL query or perform any other logic.
            return Ok(connection.Query("select * from Registeration where ID = @ID", new{ID = id}).AsList());
        }
    }

    [HttpPost]
    public IActionResult Post(Temp shoe)
    {
        Console.Write("Posting:  " + shoe.FName);
        var sds = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(sds))
        {
            return Ok(connection.Query("insert into Registeration values(@FName, @Username, @Password, @roleID)",
             new { FName = shoe.FName, Username = shoe.Username, Password = shoe.Password, roleID = shoe.roleID }).AsList());
        }
    }

    [HttpPost, Route("login")]
    public IActionResult Login(Ltemp param)
    {
        using (SqlConnection connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection")))
        {
            var sd = connection.Query<Pmet>("select ID, roleID, Username from Registeration where Username = @Username and Password = @Password", new
            {
                Username = param.Username,
                Password = param.Password
            }).FirstOrDefault();

           if (sd != null)
            {
                // Generate a JWT token
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.Name, sd.ID.ToString()),
                        new Claim(ClaimTypes.Name, sd.roleID.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddMinutes(Convert.ToInt32(_configuration["Jwt:refreshExpireMinute"])),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                    Issuer = _configuration["Jwt:Issuer"],
                    Audience = _configuration["Jwt:Audience"]
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                return Ok(new { token = tokenString, id = sd.ID, roleID = sd.roleID, username = sd.Username });
            }
            else
            {
                return Unauthorized(null);
            }
            return Ok(new { id = sd.ID, roleID = sd.roleID, username = sd.Username });
        }
    }

    [HttpPost, Route("send")]
    public IActionResult Send(Chats chats)
    {
        Console.Write("Posting:  " + chats.s_username);
        var sds = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(sds))
        {
            return Ok(connection.Query("insert into Chats values(@sender_id, @receiver_id, @text, @date_time, @s_username, @r_username)",
             new { sender_id = chats.sender_id, receiver_id = chats.receiver_id, text = chats.text,
             date_time = chats.date_time, s_username = chats.s_username, r_username = chats.r_username}).AsList());
        }
    }

    [HttpPut]
    public IActionResult Put(Pmet list)
    {
        Console.Write("Updating|:  " + list.ID);

        var data = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(data))
        {
            return Ok(connection.Query("update Registeration set FName=@FName, Username=@Username, Password=@Password, roleID=@roleID where ID=@ID",
            new { ID = list.ID, FName = list.FName, Username = list.Username, Password = list.Password, roleID = list.roleID }).AsList());
        }

    }

    [HttpDelete]
    public IActionResult Delete(int id)
    {
        Console.Write("deleting " + id);

        var data = _configuration.GetConnectionString("DefaultConnection");
        using (SqlConnection connection = new SqlConnection(data))
        {
            return Ok(connection.Query("delete from Registeration where ID=@ID", new { ID = id }).AsList());
        }

    }

    public class Temp
    {
        public int ID { get; set; }
        public required string FName { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public int roleID { get; set; }
    }

    public class Ltemp
    {
        [Required]
        public string? Username { get; set; }
        public string? Password { get; set; }

    }

    public class Chats
    {
        [Required]
        public required int sender_id { get; set; }
        public required string receiver_id{ get; set; }
        public required string text{get; set; }
        public required DateTime date_time{ get; set; }
        public required string s_username { get; set; }
        public required string r_username { get; set; }

    }

    public class Pmet
    {
        [Required]
        public required int ID { get; set; }
        public string? FName { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public int? roleID { get; set; }
    }

}