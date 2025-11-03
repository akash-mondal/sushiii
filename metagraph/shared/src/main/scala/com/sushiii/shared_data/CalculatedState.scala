package com.sushiii.shared_data

import com.sushiii.shared_data.types.{ConsentEvent, PolicyVersion}
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

case class CalculatedState(
    policyVersions: Map[String, PolicyVersion] = Map.empty,
    consentEvents: List[ConsentEvent] = List.empty
)

object CalculatedState {
  implicit val encoder: Encoder[CalculatedState] = deriveEncoder[CalculatedState]
  implicit val decoder: Decoder[CalculatedState] = deriveDecoder[CalculatedState]

  val empty: CalculatedState = CalculatedState()
}
