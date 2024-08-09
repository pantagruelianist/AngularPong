using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class GameController : ControllerBase
{
    [HttpGet("score")]
    public IActionResult GetScore()
    {
        // Return score data
        return Ok(new { player1 = 0, player2 = 0 });
    }

    [HttpPost("updateScore")]
    public IActionResult UpdateScore([FromBody] ScoreUpdateModel scoreUpdate)
    {
        // Update score logic
        return Ok();
    }
}

public class ScoreUpdateModel
{
    public int Player1Score { get; set; }
    public int Player2Score { get; set; }
}
