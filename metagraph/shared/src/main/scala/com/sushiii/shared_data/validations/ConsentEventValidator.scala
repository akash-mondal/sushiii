package com.sushiii.shared_data.validations

import cats.syntax.all._
import com.sushiii.shared_data.CalculatedState
import com.sushiii.shared_data.types.ConsentEvent

object ConsentEventValidator {
  sealed trait ValidationError
  case class PolicyVersionNotFound(policyId: String, version: String) extends ValidationError
  case class FutureTimestamp(timestamp: String) extends ValidationError
  case class InvalidSubjectId(subjectId: String) extends ValidationError

  def validate(
      consentEvent: ConsentEvent,
      state: CalculatedState
  ): Either[ValidationError, Unit] = {
    for {
      _ <- validatePolicyVersionExists(consentEvent, state)
      _ <- validateTimestamp(consentEvent)
      _ <- validateSubjectId(consentEvent)
    } yield ()
  }

  private def validatePolicyVersionExists(
      consentEvent: ConsentEvent,
      state: CalculatedState
  ): Either[ValidationError, Unit] = {
    val key = s"${consentEvent.policy_ref.policy_id}:${consentEvent.policy_ref.version}"
    if (state.policyVersions.contains(key)) {
      Right(())
    } else {
      Left(PolicyVersionNotFound(consentEvent.policy_ref.policy_id, consentEvent.policy_ref.version))
    }
  }

  private def validateTimestamp(consentEvent: ConsentEvent): Either[ValidationError, Unit] = {
    try {
      val eventTime = java.time.Instant.parse(consentEvent.timestamp)
      val now = java.time.Instant.now()
      if (eventTime.isAfter(now)) {
        Left(FutureTimestamp(consentEvent.timestamp))
      } else {
        Right(())
      }
    } catch {
      case _: Exception => Left(FutureTimestamp(consentEvent.timestamp))
    }
  }

  private def validateSubjectId(consentEvent: ConsentEvent): Either[ValidationError, Unit] = {
    val subjectId = consentEvent.subject_id
    if (subjectId.matches("^[a-f0-9]{64}$")) {
      Right(())
    } else {
      Left(InvalidSubjectId(subjectId))
    }
  }
}
